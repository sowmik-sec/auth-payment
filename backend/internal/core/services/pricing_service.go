package services

import (
	"context"
	"errors"
	"time"

	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/ports"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PricingServiceImpl struct {
	repo    ports.PricingRepository
	gateway ports.PaymentGateway
}

func NewPricingService(repo ports.PricingRepository, gateway ports.PaymentGateway) ports.PricingService {
	return &PricingServiceImpl{repo: repo, gateway: gateway}
}

func (s *PricingServiceImpl) CreatePlan(ctx context.Context, plan *domain.PricingPlan) error {
	// 1. Basic Validation
	if plan.Name == "" {
		return errors.New("plan name is required")
	}
	if plan.Type == "" {
		return errors.New("pricing type is required")
	}

	// 2. Type-Specific Validation
	var amount float64
	var currency string
	var interval string

	switch plan.Type {
	case domain.PricingTypeOneTime:
		if plan.OneTimeConfig == nil || plan.OneTimeConfig.Price < 0 {
			return errors.New("invalid one-time config")
		}
		amount = plan.OneTimeConfig.Price
		currency = plan.OneTimeConfig.Currency
	case domain.PricingTypeSubscription:
		if plan.SubscriptionConfig == nil || plan.SubscriptionConfig.Price < 0 {
			return errors.New("invalid subscription config")
		}
		amount = plan.SubscriptionConfig.Price
		currency = plan.SubscriptionConfig.Currency
		interval = "month" // Default to monthly for now, TODO: Make configurable
	case domain.PricingTypeSplit:
		if plan.SplitConfig == nil || plan.SplitConfig.TotalAmount <= 0 {
			return errors.New("invalid split payment config")
		}
	case domain.PricingTypeTiered:
		if plan.TieredConfig == nil || len(plan.TieredConfig.Tiers) == 0 {
			return errors.New("invalid tiered config")
		}
	case domain.PricingTypeDonation:
		if plan.DonationConfig == nil || plan.DonationConfig.MinAmount < 0 {
			return errors.New("invalid donation config")
		}
	case domain.PricingTypeBundle:
		if plan.BundleConfig == nil || plan.BundleConfig.Price < 0 || len(plan.BundleConfig.IncludedProductIDs) == 0 {
			return errors.New("invalid bundle config (must have price and included products)")
		}
		amount = plan.BundleConfig.Price
		currency = "USD"
	default:
		return errors.New("unknown pricing type")
	}

	// 3. Constraints Validation
	if plan.LimitedSell != nil {
		if plan.LimitedSell.MaxQuantity <= 0 {
			return errors.New("max quantity for limited sell must be greater than 0")
		}
	}

	if plan.EarlyBird != nil {
		if plan.EarlyBird.DiscountAmount <= 0 {
			return errors.New("early bird discount amount must be greater than 0")
		}
		if plan.EarlyBird.Deadline.Before(time.Now()) {
			return errors.New("early bird deadline must be in the future")
		}
	}

	if plan.AccessDuration != nil {
		if plan.AccessDuration.DurationDays <= 0 {
			return errors.New("access duration days must be greater than 0")
		}
	}

	// 4. Stripe Sync
	// Only sync if we have a valid amount/currency identified above (OneTime, Subscription, Bundle)
	if amount > 0 && currency != "" {
		prodID, err := s.gateway.CreateProduct(ctx, plan.Name, plan.Description)
		if err == nil {
			plan.StripeProductID = prodID

			priceID, err := s.gateway.CreatePrice(ctx, prodID, amount, currency, interval)
			if err == nil {
				plan.StripePriceID = priceID
			} else {
				// Log error but proceed? Or fail? For now, we proceed but maybe log.
				// In production, we should roll back or fail.
			}
		} else {
			// Log error
		}
	}

	plan.CreatedAt = time.Now()
	plan.UpdatedAt = time.Now()
	plan.IsActive = true

	return s.repo.CreatePlan(ctx, plan)
}

func (s *PricingServiceImpl) GetPlan(ctx context.Context, id string) (*domain.PricingPlan, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid plan ID")
	}
	return s.repo.GetPlanByID(ctx, oid)
}

func (s *PricingServiceImpl) ListPlans(ctx context.Context, productID *string) ([]*domain.PricingPlan, error) {
	var pOID *primitive.ObjectID
	if productID != nil && *productID != "" {
		oid, err := primitive.ObjectIDFromHex(*productID)
		if err != nil {
			return nil, errors.New("invalid product ID")
		}
		pOID = &oid
	}
	return s.repo.GetPlans(ctx, pOID)
}

func (s *PricingServiceImpl) CalculateFinalPrice(ctx context.Context, planID string, couponCode string) (float64, error) {
	// Placeholder for now. Will contain Logic for coupons, early bird, etc.
	plan, err := s.GetPlan(ctx, planID)
	if err != nil {
		return 0, err
	}

	var basePrice float64
	switch plan.Type {
	case domain.PricingTypeOneTime:
		basePrice = plan.OneTimeConfig.Price
	case domain.PricingTypeSubscription:
		basePrice = plan.SubscriptionConfig.Price
	// Add logic for others
	default:
		return 0, errors.New("unsupported price calculation type")
	}

	// TODO: Apply Coupon Logic here

	return basePrice, nil
}

func (s *PricingServiceImpl) UpdatePlan(ctx context.Context, id string, name string, description string) error {
	// 1. Get Plan
	plan, err := s.GetPlan(ctx, id)
	if err != nil {
		return err
	}

	// 2. Sync with Stripe
	if plan.StripeProductID != "" {
		err := s.gateway.UpdateProduct(ctx, plan.StripeProductID, name, description)
		if err != nil {
			// Log error but proceed?
			// log.Println("Failed to sync update to Stripe:", err)
		}
	}

	// 3. Update Local Plan
	plan.Name = name
	plan.Description = description
	plan.UpdatedAt = time.Now()

	return s.repo.UpdatePlan(ctx, plan)
}

func (s *PricingServiceImpl) DeletePlan(ctx context.Context, id string) error {
	// 1. Get Plan
	plan, err := s.GetPlan(ctx, id)
	if err != nil {
		return err
	}

	// 2. Sync with Stripe (Archive)
	if plan.StripeProductID != "" {
		err := s.gateway.ArchiveProduct(ctx, plan.StripeProductID)
		if err != nil {
			// Log error but proceed?
			// log.Println("Failed to sync delete (archive) to Stripe:", err)
		}
	}

	// 3. Delete Local Plan
	oid, _ := primitive.ObjectIDFromHex(id)
	return s.repo.DeletePlan(ctx, oid)
}
