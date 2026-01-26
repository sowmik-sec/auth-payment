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
	repo ports.PricingRepository
}

func NewPricingService(repo ports.PricingRepository) ports.PricingService {
	return &PricingServiceImpl{repo: repo}
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
	switch plan.Type {
	case domain.PricingTypeOneTime:
		if plan.OneTimeConfig == nil || plan.OneTimeConfig.Price < 0 {
			return errors.New("invalid one-time config")
		}
	case domain.PricingTypeSubscription:
		if plan.SubscriptionConfig == nil || plan.SubscriptionConfig.Price < 0 {
			return errors.New("invalid subscription config")
		}
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
	default:
		return errors.New("unknown pricing type")
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

func (s *PricingServiceImpl) ListPlansForProduct(ctx context.Context, productID string) ([]*domain.PricingPlan, error) {
	oid, err := primitive.ObjectIDFromHex(productID)
	if err != nil {
		return nil, errors.New("invalid product ID")
	}
	return s.repo.GetPlansByProductID(ctx, oid)
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
