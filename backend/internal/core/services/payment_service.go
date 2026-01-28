package services

import (
	"context"
	"errors"
	"log"

	"auth-payment-backend/internal/adapters/config" // Added
	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/ports"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PaymentServiceImpl struct {
	gateway      ports.PaymentGateway
	pricingSvc   ports.PricingService
	affiliateSvc ports.AffiliateService
	couponSvc    ports.CouponService
	userRepo     ports.UserRepository
	config       *config.Config // Added
}

func NewPaymentService(gateway ports.PaymentGateway, pricingSvc ports.PricingService, affiliateSvc ports.AffiliateService, couponSvc ports.CouponService, userRepo ports.UserRepository, cfg *config.Config) *PaymentServiceImpl {
	return &PaymentServiceImpl{
		gateway:      gateway,
		pricingSvc:   pricingSvc,
		affiliateSvc: affiliateSvc,
		couponSvc:    couponSvc,
		userRepo:     userRepo,
		config:       cfg,
	}
}

// InitiateCheckout creates a PaymentIntent for a specific Plan
func (s *PaymentServiceImpl) InitiateCheckout(ctx context.Context, userID string, planID string, affiliateCode string, couponCode string, inputAmount float64, quantity int) (string, error) {
	// 1. Get Plan Details
	plan, err := s.pricingSvc.GetPlan(ctx, planID)
	if err != nil {
		return "", err
	}

	// [New] Determine Destination (Creator) and Application Fee
	var destinationAccountID string
	var applicationFeeAmount int64
	var applicationFeePercent float64

	// Lookup Creator
	if plan.CreatorID.IsZero() {
		log.Printf("Warning: Plan %s has no CreatorID. Proceeding as platform-only sale.", planID)
	} else {
		log.Printf("Looking up creator for PlanID: %s, CreatorID: %s", planID, plan.CreatorID.Hex())
		creator, err := s.userRepo.GetByID(ctx, plan.CreatorID.Hex())
		if err != nil {
			// Instead of failing, we log and proceed as platform sale
			log.Printf("Warning: Failed to lookup creator (ID: %s): %v. Proceeding as platform-only sale.", plan.CreatorID.Hex(), err)
		} else {
			log.Printf("Found Creator: %s, ConnectID: %s, Status: %s", creator.FullName, creator.StripeConnectID, creator.StripeConnectStatus)

			// Check if creator is connected and active
			if creator.StripeConnectID != "" && creator.StripeConnectStatus == "active" {
				destinationAccountID = creator.StripeConnectID

				// Calculate Fee
				feePercent := s.config.PlatformFeePercent
				if feePercent < 0 {
					feePercent = 0
				}

				// For subscription, we simply pass the percent
				applicationFeePercent = feePercent
			}
		}
	}

	// 2. Handle Subscription Logic
	// If it's a subscription AND has a Stripe Price ID, we use the Subscription flow.
	if plan.Type == domain.PricingTypeSubscription && plan.StripePriceID != "" {
		// A. Get User
		user, err := s.userRepo.GetByID(ctx, userID)
		if err != nil {
			return "", err
		}

		// B. Ensure Stripe Customer Exists
		if user.StripeCustomerID == "" {
			cusID, err := s.gateway.CreateCustomer(ctx, user.Email, user.FullName)
			if err != nil {
				return "", err
			}
			user.StripeCustomerID = cusID
			if err := s.userRepo.Update(ctx, user); err != nil {
				// Continue strictly speaking
			}
		}

		// C. Create Subscription
		metadata := map[string]string{
			"plan_id": planID,
			"user_id": userID,
		}
		if affiliateCode != "" {
			metadata["affiliate_code"] = affiliateCode
		}
		if couponCode != "" {
			metadata["coupon_code"] = couponCode
		}

		// Pass Connect args
		subID, err := s.gateway.CreateSubscription(ctx, user.StripeCustomerID, plan.StripePriceID, metadata, destinationAccountID, applicationFeePercent)
		if err != nil {
			return "", err
		}

		return subID, nil
	}

	// 3. Fallback to Standard One-Time Payment Logic (existing code)
	// Calculate Final Amount
	amount := 0.0
	currency := "USD"

	switch plan.Type {
	case domain.PricingTypeOneTime:
		amount = plan.OneTimeConfig.Price
		currency = plan.OneTimeConfig.Currency
	case domain.PricingTypeSubscription:
		// Fallback for subscriptions without Stripe Price ID (legacy/local)
		amount = plan.SubscriptionConfig.Price
		currency = plan.SubscriptionConfig.Currency
	case domain.PricingTypeBundle:
		amount = plan.BundleConfig.Price
		currency = "USD"
	case domain.PricingTypeSplit:
		if plan.SplitConfig.UpfrontPayment > 0 {
			amount = plan.SplitConfig.UpfrontPayment
		} else {
			amount = plan.SplitConfig.TotalAmount / float64(plan.SplitConfig.InstallmentCount)
		}
		currency = plan.SplitConfig.Currency
	case domain.PricingTypeDonation:
		if inputAmount < plan.DonationConfig.MinAmount {
			return "", errors.New("donation amount below minimum")
		}
		amount = inputAmount
		currency = plan.DonationConfig.Currency
	case domain.PricingTypeTiered:
		if quantity <= 0 {
			quantity = 1
		}
		var unitPrice float64
		found := false
		for _, tier := range plan.TieredConfig.Tiers {
			max := tier.MaxQty
			if max == -1 {
				max = int(1e9)
			}
			if quantity >= tier.MinQty && quantity <= max {
				unitPrice = tier.UnitPrice
				found = true
				break
			}
		}
		if !found {
			return "", errors.New("invalid quantity")
		}
		amount = unitPrice * float64(quantity)
		currency = "USD"
	default:
		return "", errors.New("unsupported plan type")
	}

	// 4. Apply Coupon (One-Time Logic)
	if couponCode != "" {
		_, discount, err := s.couponSvc.ValidateCoupon(ctx, couponCode, planID)
		if err != nil {
			return "", errors.New("invalid coupon: " + err.Error())
		}
		amount -= discount
		if amount < 0 {
			amount = 0
		}
	}

	// NEW: Calculate Application Fee Amount for One-Time Payment
	if destinationAccountID != "" {
		// Calculate fee on the FINAL amount (after discount)
		feePercent := s.config.PlatformFeePercent
		applicationFeeAmount = int64(amount * (feePercent / 100) * 100) // cents
	}

	// 5. Create PaymentIntent
	metadata := map[string]string{
		"plan_id": planID,
		"user_id": userID,
	}
	if affiliateCode != "" {
		metadata["affiliate_code"] = affiliateCode
	}
	if couponCode != "" {
		metadata["coupon_code"] = couponCode
	}

	return s.gateway.CreatePaymentIntent(ctx, amount, currency, metadata, destinationAccountID, applicationFeeAmount)
}

// ProcessPaymentSuccess handles the post-payment logic (Webhooks)
func (s *PaymentServiceImpl) ProcessPaymentSuccess(ctx context.Context, amount float64, currency string, metadata map[string]string) error {
	// 1. Mark Payment as Paid in DB (TODO)

	// 2. Handle Affiliate Commission
	// 2. Handle Affiliate Commission
	if code, ok := metadata["affiliate_code"]; ok && code != "" {
		// We need an Order ID to link the commission to.
		// For now, we use a mock one or the PaymentIntentID if passed in metadata.
		mockOrderID := primitive.NewObjectID().Hex()

		_, err := s.affiliateSvc.ProcessCommission(ctx, mockOrderID, amount, code)
		if err != nil {
			// Log error but don't fail the whole payment success processing
			// log.Printf("Failed to process commission: %v", err)
			return err
		}
	}

	// 3. Handle Coupon Usage
	if code, ok := metadata["coupon_code"]; ok && code != "" {
		if err := s.couponSvc.ApplyCoupon(ctx, code); err != nil {
			// Log error
			// return err
		}
	}

	return nil
}
