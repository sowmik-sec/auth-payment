package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Membership represents a product (Course, Community, etc.) that can be purchased
// In EzyCourse terms, this is the "Item" being sold.
type Membership struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	CreatorID   primitive.ObjectID   `bson:"creator_id" json:"creator_id"`
	Name        string               `bson:"name" json:"name"`
	Description string               `bson:"description" json:"description"`
	Thumbnail   string               `bson:"thumbnail" json:"thumbnail"`
	Benefits    []string             `bson:"benefits" json:"benefits"` // "Why choose this plan type"
	PlanIDs     []primitive.ObjectID `bson:"plan_ids" json:"plan_ids"` // Pricing plans available for this membership
	IsActive    bool                 `bson:"is_active" json:"is_active"`
	CreatedAt   time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time            `bson:"updated_at" json:"updated_at"`
}
