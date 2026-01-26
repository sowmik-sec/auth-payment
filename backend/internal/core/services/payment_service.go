package services

import (
	"context"
	"errors"

	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/ports"
)

type PaymentServiceImpl struct {
	gateway    ports.PaymentGateway
	pricingSvc ports.PricingService
	// walletSvc  ports.WalletService // Will add later
}

func NewPaymentService(gateway ports.PaymentGateway, pricingSvc ports.PricingService) *PaymentServiceImpl {
	return &PaymentServiceImpl{
		gateway:    gateway,
		pricingSvc: pricingSvc,
	}
}

// InitiateCheckout creates a PaymentIntent for a specific Plan
func (s *PaymentServiceImpl) InitiateCheckout(ctx context.Context, userID string, planID string) (string, error) {
	// 1. Get Plan Details
	plan, err := s.pricingSvc.GetPlan(ctx, planID)
	if err != nil {
		return "", err
	}

	// 2. Calculate Final Amount (TODO: Coupons)
	amount := 0.0
	currency := "USD"

	switch plan.Type {
	case domain.PricingTypeOneTime:
		amount = plan.OneTimeConfig.Price
		currency = plan.OneTimeConfig.Currency
	case domain.PricingTypeSubscription:
		amount = plan.SubscriptionConfig.Price
		currency = plan.SubscriptionConfig.Currency
	default:
		return "", errors.New("unsupported plan type for basic checkout")
	}

	// 3. Create PaymentIntent via Gateway
	metadata := map[string]string{
		"plan_id": planID,
		"user_id": userID,
	}

	clientSecret, err := s.gateway.CreatePaymentIntent(ctx, amount, currency, metadata)
	if err != nil {
		return "", err
	}

	// 4. Save Pending Payment Record in DB (TODO: PaymentRepository)
	// payment := &domain.Payment{...}
	// repo.Save(payment)

	return clientSecret, nil
}
