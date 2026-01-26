package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AffiliateProgram: Global or Product-specific settings
type AffiliateProgram struct {
	ID             primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	CreatorID      primitive.ObjectID  `bson:"creator_id" json:"creator_id"`
	ProductID      *primitive.ObjectID `bson:"product_id,omitempty" json:"product_id,omitempty"` // If nil, global for creator
	CommissionRate float64             `bson:"commission_rate" json:"commission_rate"`           // Percentage (e.g. 10.0 for 10%)
	IsActive       bool                `bson:"is_active" json:"is_active"`
	CreatedAt      time.Time           `bson:"created_at" json:"created_at"`
}

// AffiliateLink: Usage specific link for a user
type AffiliateLink struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"` // Who owns this link
	ProgramID   primitive.ObjectID `bson:"program_id" json:"program_id"`
	Code        string             `bson:"code" json:"code"` // Unique slug, e.g. "AHMED20"
	Url         string             `bson:"url" json:"url"`
	Clicks      int                `bson:"clicks" json:"clicks"`
	Conversions int                `bson:"conversions" json:"conversions"` // Number of sales
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
}

// Commission: Log of earnings
type Commission struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	AffiliateID  primitive.ObjectID `bson:"affiliate_user_id" json:"affiliate_user_id"` // User who gets money
	LinkID       primitive.ObjectID `bson:"link_id" json:"link_id"`
	OrderID      primitive.ObjectID `bson:"order_id" json:"order_id"`           // Source Transaction
	TotalAmount  float64            `bson:"total_amount" json:"total_amount"`   // Sale Price
	EarnedAmount float64            `bson:"earned_amount" json:"earned_amount"` // Calculated Commission
	Status       string             `bson:"status" json:"status"`               // pending, paid, cancelled
	CreatedAt    time.Time          `bson:"created_at" json:"created_at"`
}
