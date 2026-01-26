package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type InvoiceStatus string

const (
	InvoiceStatusPaid    InvoiceStatus = "paid"
	InvoiceStatusPending InvoiceStatus = "pending"
	InvoiceStatusVoid    InvoiceStatus = "void"
)

type Invoice struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID        primitive.ObjectID `bson:"user_id" json:"user_id"`
	TransactionID primitive.ObjectID `bson:"transaction_id" json:"transaction_id"` // Link to WalletTransaction or Payment
	InvoiceNumber string             `bson:"invoice_number" json:"invoice_number"` // e.g. INV-2024-001

	Items       []InvoiceItem `bson:"items" json:"items"`
	SubTotal    float64       `bson:"sub_total" json:"sub_total"`
	TaxAmount   float64       `bson:"tax_amount" json:"tax_amount"`
	TotalAmount float64       `bson:"total_amount" json:"total_amount"`
	Currency    string        `bson:"currency" json:"currency"`

	Status       InvoiceStatus `bson:"status" json:"status"`
	GeneratedURL string        `bson:"generated_url,omitempty" json:"generated_url,omitempty"` // If stored in S3

	CreatedAt time.Time  `bson:"created_at" json:"created_at"`
	PaidAt    *time.Time `bson:"paid_at,omitempty" json:"paid_at,omitempty"`
}

type InvoiceItem struct {
	Description string  `bson:"description" json:"description"`
	Quantity    int     `bson:"quantity" json:"quantity"`
	UnitPrice   float64 `bson:"unit_price" json:"unit_price"`
	Total       float64 `bson:"total" json:"total"`
}
