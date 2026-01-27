package ports

import (
	"context"
)

type PaymentGateway interface {
	// core payments
	CreatePaymentIntent(ctx context.Context, amount float64, currency string, metadata map[string]string) (string, error)
	ConfirmPayment(ctx context.Context, paymentID string) error

	// products & prices (sync)
	CreateProduct(ctx context.Context, name string, description string) (string, error)
	CreatePrice(ctx context.Context, productID string, amount float64, currency string, interval string) (string, error)
	UpdateProduct(ctx context.Context, productID string, name string, description string) error
	ArchiveProduct(ctx context.Context, productID string) error

	// subscriptions
	CreateCustomer(ctx context.Context, email string, name string) (string, error)
	CreateSubscription(ctx context.Context, customerID string, priceID string, metadata map[string]string) (string, error)
	CancelSubscription(ctx context.Context, subID string) error
}
