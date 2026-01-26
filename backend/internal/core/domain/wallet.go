package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Wallet represents a user's balance in the platform
type Wallet struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"` // Creator or Affiliate
	Balance   float64            `bson:"balance" json:"balance"`
	Currency  string             `bson:"currency" json:"currency"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

type TransactionType string

const (
	TransactionTypeSale       TransactionType = "sale"
	TransactionTypeRefund     TransactionType = "refund"
	TransactionTypePayout     TransactionType = "payout"
	TransactionTypeCommission TransactionType = "commission"
)

// WalletTransaction records every movement of funds (Double Entry Ledger principle)
type WalletTransaction struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	WalletID    primitive.ObjectID `bson:"wallet_id" json:"wallet_id"`
	Amount      float64            `bson:"amount" json:"amount"` // Positive = Credit, Negative = Debit
	Type        TransactionType    `bson:"type" json:"type"`
	ReferenceID primitive.ObjectID `bson:"reference_id" json:"reference_id"` // OrderID or PayoutID
	Description string             `bson:"description" json:"description"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
}

type PayoutStatus string

const (
	PayoutStatusPending   PayoutStatus = "pending"
	PayoutStatusPaid      PayoutStatus = "paid"
	PayoutStatusFailed    PayoutStatus = "failed"
	PayoutStatusCancelled PayoutStatus = "cancelled"
)

type PayoutMethod string

const (
	PayoutMethodStripe PayoutMethod = "stripe"
	PayoutMethodPaypal PayoutMethod = "paypal"
)

// PayoutRequest represents a withdrawal request
type PayoutRequest struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	Amount      float64            `bson:"amount" json:"amount"`
	Currency    string             `bson:"currency" json:"currency"`
	Status      PayoutStatus       `bson:"status" json:"status"`
	Method      PayoutMethod       `bson:"method" json:"method"`
	ProcessedAt *time.Time         `bson:"processed_at,omitempty" json:"processed_at,omitempty"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
}
