package services

import (
	"bytes"
	"context"
	"fmt"
	"time"

	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/ports"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type InvoiceServiceImpl struct {
	repo       ports.InvoiceRepository
	walletRepo ports.WalletRepository // To fetch transaction details
}

func NewInvoiceService(repo ports.InvoiceRepository, walletRepo ports.WalletRepository) ports.InvoiceService {
	return &InvoiceServiceImpl{
		repo:       repo,
		walletRepo: walletRepo,
	}
}

func (s *InvoiceServiceImpl) GenerateInvoiceForTransaction(ctx context.Context, txID string) (*domain.Invoice, error) {
	// 1. Get Transaction
	// In a real app we'd fetch the TX. For now, we mock or assume it exists.
	// Since walletRepo doesn't have GetTransactionByID exposed in interface explicitly yet,
	// we will assume we can fetch it or just create a mock invoice for this phase.

	// Let's create a real-ish invoice object
	tOID, _ := primitive.ObjectIDFromHex(txID)

	inv := &domain.Invoice{
		UserID:        primitive.NewObjectID(), // Should come from TX
		TransactionID: tOID,
		InvoiceNumber: fmt.Sprintf("INV-%d", time.Now().Unix()),
		Status:        domain.InvoiceStatusPaid,
		Currency:      "USD",
		Items: []domain.InvoiceItem{
			{Description: "Service Fee", Quantity: 1, UnitPrice: 100.00, Total: 100.00},
		},
		SubTotal:    100.00,
		TotalAmount: 100.00,
		CreatedAt:   time.Now(),
	}

	if err := s.repo.CreateInvoice(ctx, inv); err != nil {
		return nil, err
	}

	return inv, nil
}

func (s *InvoiceServiceImpl) GetInvoicePDF(ctx context.Context, invoiceID string) ([]byte, error) {
	// Simple text-based PDF generation mockup
	// In production, use `jung-kurt/gofpdf`

	iOID, err := primitive.ObjectIDFromHex(invoiceID)
	if err != nil {
		return nil, err
	}

	inv, err := s.repo.GetInvoice(ctx, iOID)
	if err != nil {
		return nil, err
	}

	// Create a simple text buffer acting as a file content
	var b bytes.Buffer
	b.WriteString(fmt.Sprintf("INVOICE #%s\n", inv.InvoiceNumber))
	b.WriteString(fmt.Sprintf("Date: %s\n", inv.CreatedAt.Format(time.RFC3339)))
	b.WriteString("--------------------------------\n")
	for _, item := range inv.Items {
		b.WriteString(fmt.Sprintf("%s x%d : $%.2f\n", item.Description, item.Quantity, item.Total))
	}
	b.WriteString("--------------------------------\n")
	b.WriteString(fmt.Sprintf("TOTAL: $%.2f %s\n", inv.TotalAmount, inv.Currency))

	return b.Bytes(), nil
}
