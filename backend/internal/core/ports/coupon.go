package ports

import (
	"auth-payment-backend/internal/core/domain"
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CouponRepository interface {
	CreateCoupon(ctx context.Context, coupon *domain.Coupon) error
	GetCouponByCode(ctx context.Context, code string) (*domain.Coupon, error)
	GetCouponByID(ctx context.Context, id primitive.ObjectID) (*domain.Coupon, error)
	ListCoupons(ctx context.Context) ([]*domain.Coupon, error)
	IncrementUsage(ctx context.Context, code string) error
	UpdateCoupon(ctx context.Context, coupon *domain.Coupon) error
	DeleteCoupon(ctx context.Context, id primitive.ObjectID) error
}

type CouponService interface {
	CreateCoupon(ctx context.Context, coupon *domain.Coupon) error
	GetCoupon(ctx context.Context, id string) (*domain.Coupon, error)
	ListCoupons(ctx context.Context) ([]*domain.Coupon, error)
	ValidateCoupon(ctx context.Context, code string, planID string) (*domain.Coupon, float64, error) // Returns coupon and discount amount
	ApplyCoupon(ctx context.Context, code string) error                                              // Increments usage
}
