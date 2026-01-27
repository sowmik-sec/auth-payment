package services

import (
	"context"
	"errors"

	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/ports"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PaymentServiceImpl struct {
	gateway      ports.PaymentGateway
	pricingSvc   ports.PricingService
	affiliateSvc ports.AffiliateService
	couponSvc    ports.CouponService
}

func NewPaymentService(gateway ports.PaymentGateway, pricingSvc ports.PricingService, affiliateSvc ports.AffiliateService, couponSvc ports.CouponService) *PaymentServiceImpl {
	return &PaymentServiceImpl{
		gateway:      gateway,
		pricingSvc:   pricingSvc,
		affiliateSvc: affiliateSvc,
		couponSvc:    couponSvc,
	}
}

// InitiateCheckout creates a PaymentIntent for a specific Plan
func (s *PaymentServiceImpl) InitiateCheckout(ctx context.Context, userID string, planID string, affiliateCode string, couponCode string, inputAmount float64, quantity int) (string, error) {
	// 1. Get Plan Details
	plan, err := s.pricingSvc.GetPlan(ctx, planID)
	if err != nil {
		return "", err
	}

	// 2. Calculate Final Amount
	amount := 0.0
	currency := "USD"

	switch plan.Type {
	case domain.PricingTypeOneTime:
		amount = plan.OneTimeConfig.Price
		currency = plan.OneTimeConfig.Currency
	case domain.PricingTypeSubscription:
		amount = plan.SubscriptionConfig.Price
		currency = plan.SubscriptionConfig.Currency
	case domain.PricingTypeBundle:
		amount = plan.BundleConfig.Price
		currency = "USD" // Default logic for bundles
	case domain.PricingTypeSplit:
		// Default logic: Pay Upfront amount (if > 0) OR first installment
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
		// Logic: input Quantity determines price
		if quantity <= 0 {
			quantity = 1 // Default
		}
		var unitPrice float64
		found := false
		for _, tier := range plan.TieredConfig.Tiers {
			// max_qty = -1 means infinite
			max := tier.MaxQty
			if max == -1 {
				max = int(1e9) // Arbitrary large number
			}
			if quantity >= tier.MinQty && quantity <= max {
				unitPrice = tier.UnitPrice
				found = true
				break
			}
		}
		if !found {
			return "", errors.New("invalid quantity for tiered pricing")
		}
		amount = unitPrice * float64(quantity)
		currency = "USD"
	default:
		return "", errors.New("unsupported plan type for basic checkout")
	}

	// 3. Apply Coupon if provided
	if couponCode != "" {
		// Validate Coupon
		_, discount, err := s.couponSvc.ValidateCoupon(ctx, couponCode, planID)
		if err != nil {
			return "", errors.New("invalid coupon: " + err.Error())
		}

		// Apply Discount
		amount -= discount
		if amount < 0 {
			amount = 0
		}
	}

	// 4. Create PaymentIntent via Gateway
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

	clientSecret, err := s.gateway.CreatePaymentIntent(ctx, amount, currency, metadata)
	if err != nil {
		return "", err
	}

	return clientSecret, nil
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
