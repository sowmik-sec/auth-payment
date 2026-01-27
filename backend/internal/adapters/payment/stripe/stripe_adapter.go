package stripe

import (
	"context"
	"os"

	"auth-payment-backend/internal/core/ports"

	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/customer"
	"github.com/stripe/stripe-go/v76/paymentintent"
	"github.com/stripe/stripe-go/v76/price"
	"github.com/stripe/stripe-go/v76/product"
	"github.com/stripe/stripe-go/v76/subscription"
)

type StripeAdapter struct {
	AllowMock bool
}

func NewStripeAdapter() ports.PaymentGateway {
	key := os.Getenv("STRIPE_SECRET_KEY")
	if key == "" {
		// Log warning: "Stripe keys missing, interactions will fail"
		stripe.Key = "sk_test_mock_key"
		return &StripeAdapter{AllowMock: true}
	}
	stripe.Key = key
	return &StripeAdapter{AllowMock: false}
}

func (s *StripeAdapter) CreatePaymentIntent(ctx context.Context, amount float64, currency string, metadata map[string]string) (string, error) {
	if s.AllowMock {
		return "pi_mock_1234567890", nil
	}

	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(int64(amount * 100)), // Convert to cents
		Currency: stripe.String(currency),
		AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
	}

	// Convert and attach metadata
	for k, v := range metadata {
		params.AddMetadata(k, v)
	}

	pi, err := paymentintent.New(params)
	if err != nil {
		return "", err
	}

	return pi.ClientSecret, nil
}

func (s *StripeAdapter) CreateProduct(ctx context.Context, name string, description string) (string, error) {
	if s.AllowMock {
		return "prod_mock_123", nil
	}

	params := &stripe.ProductParams{
		Name:        stripe.String(name),
		Description: stripe.String(description),
	}
	prod, err := product.New(params)
	if err != nil {
		return "", err
	}
	return prod.ID, nil
}

func (s *StripeAdapter) CreatePrice(ctx context.Context, productID string, amount float64, currency string, interval string) (string, error) {
	if s.AllowMock {
		return "price_mock_123", nil
	}

	params := &stripe.PriceParams{
		Product:    stripe.String(productID),
		UnitAmount: stripe.Int64(int64(amount * 100)),
		Currency:   stripe.String(currency),
	}

	if interval != "" {
		params.Recurring = &stripe.PriceRecurringParams{
			Interval: stripe.String(interval), // "month", "year", "week", "day"
		}
	}

	p, err := price.New(params)
	if err != nil {
		return "", err
	}
	return p.ID, nil
}

func (s *StripeAdapter) CreateCustomer(ctx context.Context, email string, name string) (string, error) {
	if s.AllowMock {
		return "cus_mock_123", nil
	}

	params := &stripe.CustomerParams{
		Email: stripe.String(email),
		Name:  stripe.String(name),
	}
	c, err := customer.New(params)
	if err != nil {
		return "", err
	}
	return c.ID, nil
}

func (s *StripeAdapter) CreateSubscription(ctx context.Context, customerID string, priceID string, metadata map[string]string) (string, error) {
	if s.AllowMock {
		return "sub_mock_123", nil
	}

	params := &stripe.SubscriptionParams{
		Customer: stripe.String(customerID),
		Items: []*stripe.SubscriptionItemsParams{
			{
				Price: stripe.String(priceID),
			},
		},
		PaymentBehavior: stripe.String("default_incomplete"),
	}
	params.AddExpand("latest_invoice.payment_intent")

	// Attach Metadata
	for k, v := range metadata {
		params.AddMetadata(k, v)
	}

	sub, err := subscription.New(params)
	if err != nil {
		return "", err
	}

	if sub.LatestInvoice.PaymentIntent == nil {
		return "", nil // No payment needed or error?
	}

	return sub.LatestInvoice.PaymentIntent.ClientSecret, nil
}

func (s *StripeAdapter) ConfirmPayment(ctx context.Context, paymentID string) error {
	return nil // Usually handled via Webhook or Client SDK
}

func (s *StripeAdapter) CancelSubscription(ctx context.Context, subID string) error {
	if s.AllowMock {
		return nil
	}
	_, err := subscription.Cancel(subID, nil)
	return err
}
