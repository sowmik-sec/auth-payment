package ports

import (
	"context"

	"auth-payment-backend/internal/core/domain"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type WalletRepository interface {
	// Wallet
	CreateWallet(ctx context.Context, wallet *domain.Wallet) error
	GetWalletByUserID(ctx context.Context, userID primitive.ObjectID) (*domain.Wallet, error)
	GetWalletByID(ctx context.Context, walletID primitive.ObjectID) (*domain.Wallet, error)
	UpdateBalance(ctx context.Context, walletID primitive.ObjectID, newBalance float64) error

	// Ledger / Transactions
	CreateTransaction(ctx context.Context, tx *domain.WalletTransaction) error
	GetTransactions(ctx context.Context, walletID primitive.ObjectID) ([]*domain.WalletTransaction, error)

	// Payouts
	CreatePayoutRequest(ctx context.Context, req *domain.PayoutRequest) error
	GetPayoutsByUserID(ctx context.Context, userID primitive.ObjectID) ([]*domain.PayoutRequest, error)
	GetPendingPayouts(ctx context.Context) ([]*domain.PayoutRequest, error)
	UpdatePayoutStatus(ctx context.Context, payoutID primitive.ObjectID, status domain.PayoutStatus) error
}

type WalletService interface {
	GetBalance(ctx context.Context, userID string) (*domain.Wallet, error)
	GetTransactions(ctx context.Context, userID string) ([]*domain.WalletTransaction, error)

	// Core Logic
	CreditWallet(ctx context.Context, userID string, amount float64, txType domain.TransactionType, refID string, desc string) error
	DebitWallet(ctx context.Context, userID string, amount float64, txType domain.TransactionType, refID string, desc string) error

	// Payouts
	RequestPayout(ctx context.Context, userID string, amount float64, method domain.PayoutMethod) error
}
