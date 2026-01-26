package services

import (
	"context"
	"errors"
	"time"

	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/ports"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type WalletServiceImpl struct {
	repo ports.WalletRepository
}

func NewWalletService(repo ports.WalletRepository) ports.WalletService {
	return &WalletServiceImpl{repo: repo}
}

func (s *WalletServiceImpl) getOrCreateWallet(ctx context.Context, userID primitive.ObjectID) (*domain.Wallet, error) {
	wallet, err := s.repo.GetWalletByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if wallet == nil {
		newWallet := &domain.Wallet{
			UserID:    userID,
			Balance:   0,
			Currency:  "USD", // Default
			UpdatedAt: time.Now(),
		}
		if err := s.repo.CreateWallet(ctx, newWallet); err != nil {
			return nil, err
		}
		return newWallet, nil
	}
	return wallet, nil
}

func (s *WalletServiceImpl) GetBalance(ctx context.Context, userID string) (*domain.Wallet, error) {
	oid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}
	return s.getOrCreateWallet(ctx, oid)
}

func (s *WalletServiceImpl) GetTransactions(ctx context.Context, userID string) ([]*domain.WalletTransaction, error) {
	oid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	wallet, err := s.getOrCreateWallet(ctx, oid)
	if err != nil {
		return nil, err
	}

	return s.repo.GetTransactions(ctx, wallet.ID)
}

func (s *WalletServiceImpl) CreditWallet(ctx context.Context, userID string, amount float64, txType domain.TransactionType, refID string, desc string) error {
	if amount <= 0 {
		return errors.New("amount must be positive")
	}

	oid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}

	refOID, _ := primitive.ObjectIDFromHex(refID) // Ignore error if refID is empty/invalid, typically it should be valid

	// 1. Get Wallet
	wallet, err := s.getOrCreateWallet(ctx, oid)
	if err != nil {
		return err
	}

	// 2. Create Transaction
	tx := &domain.WalletTransaction{
		WalletID:    wallet.ID,
		Amount:      amount, // Positive
		Type:        txType,
		ReferenceID: refOID,
		Description: desc,
		CreatedAt:   time.Now(),
	}
	if err := s.repo.CreateTransaction(ctx, tx); err != nil {
		return err
	}

	// 3. Update Balance
	newBalance := wallet.Balance + amount
	return s.repo.UpdateBalance(ctx, wallet.ID, newBalance)
}

func (s *WalletServiceImpl) DebitWallet(ctx context.Context, userID string, amount float64, txType domain.TransactionType, refID string, desc string) error {
	if amount <= 0 {
		return errors.New("amount must be positive")
	}

	oid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}
	refOID, _ := primitive.ObjectIDFromHex(refID)

	// 1. Get Wallet
	wallet, err := s.getOrCreateWallet(ctx, oid)
	if err != nil {
		return err
	}

	// 2. Check Balance
	if wallet.Balance < amount {
		return errors.New("insufficient funds")
	}

	// 3. Create Transaction
	tx := &domain.WalletTransaction{
		WalletID:    wallet.ID,
		Amount:      -amount, // Negative
		Type:        txType,
		ReferenceID: refOID,
		Description: desc,
		CreatedAt:   time.Now(),
	}
	if err := s.repo.CreateTransaction(ctx, tx); err != nil {
		return err
	}

	// 4. Update Balance
	newBalance := wallet.Balance - amount
	return s.repo.UpdateBalance(ctx, wallet.ID, newBalance)
}

func (s *WalletServiceImpl) RequestPayout(ctx context.Context, userID string, amount float64, method domain.PayoutMethod) error {
	// 1. Debit wallet first (lock funds)
	err := s.DebitWallet(ctx, userID, amount, domain.TransactionTypePayout, "", "Payout Request")
	if err != nil {
		return err
	}

	oid, _ := primitive.ObjectIDFromHex(userID)

	// 2. Create Payout Request
	req := &domain.PayoutRequest{
		UserID:    oid,
		Amount:    amount,
		Currency:  "USD",
		Status:    domain.PayoutStatusPending,
		Method:    method,
		CreatedAt: time.Now(),
	}

	return s.repo.CreatePayoutRequest(ctx, req)
}
