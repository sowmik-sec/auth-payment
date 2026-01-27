package services

import (
	"context"
	"errors"
	"time"

	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/ports"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CouponServiceImpl struct {
	repo        ports.CouponRepository
	pricingRepo ports.PricingRepository
}

func NewCouponService(repo ports.CouponRepository, pricingRepo ports.PricingRepository) ports.CouponService {
	return &CouponServiceImpl{
		repo:        repo,
		pricingRepo: pricingRepo,
	}
}

func (s *CouponServiceImpl) CreateCoupon(ctx context.Context, coupon *domain.Coupon) error {
	if coupon.Code == "" {
		return errors.New("coupon code is required")
	}
	if coupon.DiscountAmount <= 0 {
		return errors.New("discount amount must be greater than 0")
	}
	if coupon.DiscountType == domain.DiscountTypePercent && coupon.DiscountAmount > 100 {
		return errors.New("percentage discount cannot exceed 100%")
	}

	coupon.CreatedAt = time.Now()
	coupon.IsActive = true
	coupon.UsedCount = 0

	return s.repo.CreateCoupon(ctx, coupon)
}

func (s *CouponServiceImpl) GetCoupon(ctx context.Context, id string) (*domain.Coupon, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid coupon ID")
	}
	return s.repo.GetCouponByID(ctx, oid)
}

func (s *CouponServiceImpl) ListCoupons(ctx context.Context) ([]*domain.Coupon, error) {
	return s.repo.ListCoupons(ctx)
}

func (s *CouponServiceImpl) ValidateCoupon(ctx context.Context, code string, planID string) (*domain.Coupon, float64, error) {
	coupon, err := s.repo.GetCouponByCode(ctx, code)
	if err != nil {
		return nil, 0, err
	}

	if !coupon.IsActive {
		return nil, 0, errors.New("coupon is inactive")
	}

	if coupon.ExpiryDate != nil && coupon.ExpiryDate.Before(time.Now()) {
		return nil, 0, errors.New("coupon established")
	}

	if coupon.MaxUses > 0 && coupon.UsedCount >= coupon.MaxUses {
		return nil, 0, errors.New("coupon usage limit reached")
	}

	// Check if applicable to plan
	if len(coupon.ApplicablePlanIDs) > 0 {
		planOID, err := primitive.ObjectIDFromHex(planID)
		if err != nil {
			return nil, 0, errors.New("invalid plan ID")
		}

		isApplicable := false
		for _, id := range coupon.ApplicablePlanIDs {
			if id == planOID {
				isApplicable = true
				break
			}
		}
		if !isApplicable {
			return nil, 0, errors.New("coupon not applicable to this plan")
		}
	}

	// Calculate discount amount
	var discount float64
	// fetching plan to calculate percentage based discount
	// For actual implementation we need the plan Price.
	// To keep it clean, we might just return the coupon and let caller calculate,
	// OR fetch plan here. Let's fetch plan here for robustness.

	planOID, _ := primitive.ObjectIDFromHex(planID) // Error handled above/irrelevant if not checking applicability?
	// Actually we should always validate plan existence
	plan, err := s.pricingRepo.GetPlanByID(ctx, planOID)
	if err != nil {
		return nil, 0, errors.New("plan not found")
	}

	var basePrice float64
	switch plan.Type {
	case domain.PricingTypeOneTime:
		basePrice = plan.OneTimeConfig.Price
	case domain.PricingTypeSubscription:
		basePrice = plan.SubscriptionConfig.Price
	case domain.PricingTypeBundle:
		basePrice = plan.BundleConfig.Price
	case domain.PricingTypeSplit:
		basePrice = plan.SplitConfig.UpfrontPayment // Usually split applies to upfront? Or absolute total? Let's say upfront for now or Total.
		// Simpler to just say we don't support split coupons yet or apply to total.
		// Let's assume total amount for simplicity of calculation, but applying to installment is complex.
		basePrice = plan.SplitConfig.TotalAmount
	default:
		// Tiered/Donation might be tricky.
		basePrice = 0
	}

	if coupon.DiscountType == domain.DiscountTypeFixed {
		discount = coupon.DiscountAmount
	} else {
		discount = (basePrice * coupon.DiscountAmount) / 100
	}

	if discount > basePrice {
		discount = basePrice
	}

	return coupon, discount, nil
}

func (s *CouponServiceImpl) ApplyCoupon(ctx context.Context, code string) error {
	return s.repo.IncrementUsage(ctx, code)
}
