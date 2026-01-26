package ports

import (
	"context"
)

type PaymentGateway interface {
	// core payments
	CreatePaymentIntent(ctx context.Context, amount float64, currency string, metadata map[string]string) (string, error)
	ConfirmPayment(ctx context.Context, paymentID string) error

	// subscriptions
	CreateCustomer(ctx context.Context, email string, name string) (string, error)
	CreateSubscription(ctx context.Context, customerID string, priceID string) (string, error)
	CancelSubscription(ctx context.Context, subID string) error
}
