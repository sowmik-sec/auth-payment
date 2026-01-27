package ports

import (
	"context"

	"auth-payment-backend/internal/core/domain"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PricingRepository interface {
	CreatePlan(ctx context.Context, plan *domain.PricingPlan) error
	GetPlanByID(ctx context.Context, id primitive.ObjectID) (*domain.PricingPlan, error)
	GetPlans(ctx context.Context, productID *primitive.ObjectID) ([]*domain.PricingPlan, error)
	UpdatePlan(ctx context.Context, plan *domain.PricingPlan) error
	DeletePlan(ctx context.Context, id primitive.ObjectID) error
}

type PricingService interface {
	CreatePlan(ctx context.Context, plan *domain.PricingPlan) error
	GetPlan(ctx context.Context, id string) (*domain.PricingPlan, error)
	ListPlans(ctx context.Context, productID *string) ([]*domain.PricingPlan, error)

	// Complex Logic
	CalculateFinalPrice(ctx context.Context, planID string, couponCode string) (float64, error)

	UpdatePlan(ctx context.Context, id string, name string, description string, price *float64, interval *string) error
	DeletePlan(ctx context.Context, id string) error
}
