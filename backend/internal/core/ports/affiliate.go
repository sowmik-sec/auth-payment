package ports

import (
	"context"

	"auth-payment-backend/internal/core/domain"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AffiliateRepository interface {
	// Program
	CreateProgram(ctx context.Context, program *domain.AffiliateProgram) error
	GetProgram(ctx context.Context, id primitive.ObjectID) (*domain.AffiliateProgram, error)
	GetGlobalProgram(ctx context.Context, creatorID primitive.ObjectID) (*domain.AffiliateProgram, error)

	// Links
	CreateLink(ctx context.Context, link *domain.AffiliateLink) error
	GetLinkByCode(ctx context.Context, code string) (*domain.AffiliateLink, error)
	GetLinksByUser(ctx context.Context, userID primitive.ObjectID) ([]*domain.AffiliateLink, error)
	RecordClick(ctx context.Context, linkID primitive.ObjectID) error

	// Commissions
	CreateCommission(ctx context.Context, comm *domain.Commission) error
	GetCommissionsByUser(ctx context.Context, userID primitive.ObjectID) ([]*domain.Commission, error)
}

type AffiliateService interface {
	CreateProgram(ctx context.Context, creatorID string, productID *string, rate float64) (*domain.AffiliateProgram, error)
	GenerateLink(ctx context.Context, userID string, programID string, code string) (*domain.AffiliateLink, error)
	TrackClick(ctx context.Context, code string) error
	ProcessCommission(ctx context.Context, orderID string, amount float64, code string) (*domain.Commission, error)

	GetMyStats(ctx context.Context, userID string) (map[string]interface{}, error)
}
