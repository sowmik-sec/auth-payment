package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/ports"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AffiliateServiceImpl struct {
	repo      ports.AffiliateRepository
	walletSvc ports.WalletService
}

func NewAffiliateService(repo ports.AffiliateRepository, walletSvc ports.WalletService) ports.AffiliateService {
	return &AffiliateServiceImpl{
		repo:      repo,
		walletSvc: walletSvc,
	}
}

func (s *AffiliateServiceImpl) CreateProgram(ctx context.Context, creatorID string, productID *string, rate float64) (*domain.AffiliateProgram, error) {
	cOID, err := primitive.ObjectIDFromHex(creatorID)
	if err != nil {
		return nil, err
	}

	var pOID *primitive.ObjectID
	if productID != nil {
		oid, err := primitive.ObjectIDFromHex(*productID)
		if err != nil {
			return nil, err
		}
		pOID = &oid
	}

	program := &domain.AffiliateProgram{
		CreatorID:      cOID,
		ProductID:      pOID,
		CommissionRate: rate,
		IsActive:       true,
		CreatedAt:      time.Now(),
	}

	if err := s.repo.CreateProgram(ctx, program); err != nil {
		return nil, err
	}
	return program, nil
}

func (s *AffiliateServiceImpl) GenerateLink(ctx context.Context, userID string, programID string, code string) (*domain.AffiliateLink, error) {
	uOID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}
	pOID, err := primitive.ObjectIDFromHex(programID)
	if err != nil {
		return nil, err
	}

	// Check if code exists
	if _, err := s.repo.GetLinkByCode(ctx, code); err == nil {
		return nil, errors.New("affiliate code already taken")
	}

	link := &domain.AffiliateLink{
		UserID:    uOID,
		ProgramID: pOID,
		Code:      code,
		Url:       fmt.Sprintf("http://localhost:5173/ref/%s", code), // TODO: Config domain
		CreatedAt: time.Now(),
	}

	if err := s.repo.CreateLink(ctx, link); err != nil {
		return nil, err
	}
	return link, nil
}

func (s *AffiliateServiceImpl) TrackClick(ctx context.Context, code string) error {
	link, err := s.repo.GetLinkByCode(ctx, code)
	if err != nil {
		return err
	}
	return s.repo.RecordClick(ctx, link.ID)
}

func (s *AffiliateServiceImpl) ProcessCommission(ctx context.Context, orderID string, amount float64, code string) (*domain.Commission, error) {
	// 1. Get Link
	link, err := s.repo.GetLinkByCode(ctx, code)
	if err != nil {
		return nil, err // Invalid code, ignore commission
	}

	// 2. Get Program to find Rate
	program, err := s.repo.GetProgram(ctx, link.ProgramID)
	if err != nil {
		return nil, err
	}

	// 3. Calculate
	commissionAmount := (amount * program.CommissionRate) / 100.0

	// 4. Create Commission Record
	oOID, _ := primitive.ObjectIDFromHex(orderID)
	comm := &domain.Commission{
		AffiliateID:  link.UserID,
		LinkID:       link.ID,
		OrderID:      oOID,
		TotalAmount:  amount,
		EarnedAmount: commissionAmount,
		Status:       "paid", // Auto-paying to wallet for simplicity
		CreatedAt:    time.Now(),
	}

	if err := s.repo.CreateCommission(ctx, comm); err != nil {
		return nil, err
	}

	// 5. Credit Wallet
	err = s.walletSvc.CreditWallet(
		ctx,
		link.UserID.Hex(),
		commissionAmount,
		domain.TransactionTypeCommission,
		comm.ID.Hex(),
		fmt.Sprintf("Commission for Order %s", orderID),
	)
	if err != nil {
		return nil, err
	}

	return comm, nil
}

func (s *AffiliateServiceImpl) GetMyStats(ctx context.Context, userID string) (map[string]interface{}, error) {
	uOID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}

	links, err := s.repo.GetLinksByUser(ctx, uOID)
	if err != nil {
		return nil, err
	}

	comms, err := s.repo.GetCommissionsByUser(ctx, uOID)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"links":       links,
		"commissions": comms,
	}, nil
}
