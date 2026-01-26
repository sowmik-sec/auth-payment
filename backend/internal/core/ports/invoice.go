package ports

import (
	"context"

	"auth-payment-backend/internal/core/domain"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type InvoiceRepository interface {
	CreateInvoice(ctx context.Context, invoice *domain.Invoice) error
	GetInvoice(ctx context.Context, invoiceID primitive.ObjectID) (*domain.Invoice, error)
	GetInvoicesByUser(ctx context.Context, userID primitive.ObjectID) ([]*domain.Invoice, error)
}

type InvoiceService interface {
	GenerateInvoiceForTransaction(ctx context.Context, txID string) (*domain.Invoice, error)
	GetInvoicePDF(ctx context.Context, invoiceID string) ([]byte, error) // Returns PDF bytes
}
