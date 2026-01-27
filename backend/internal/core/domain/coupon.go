package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type DiscountType string

const (
	DiscountTypeFixed   DiscountType = "fixed"
	DiscountTypePercent DiscountType = "percent"
)

type Coupon struct {
	ID                primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Code              string               `bson:"code" json:"code"`
	DiscountType      DiscountType         `bson:"discount_type" json:"discount_type"`
	DiscountAmount    float64              `bson:"discount_amount" json:"discount_amount"`                             // Fixed amount or Percentage (0-100)
	ApplicablePlanIDs []primitive.ObjectID `bson:"applicable_plan_ids,omitempty" json:"applicable_plan_ids,omitempty"` // empty = all plans
	MaxUses           int                  `bson:"max_uses" json:"max_uses"`                                           // 0 = unlimited
	UsedCount         int                  `bson:"used_count" json:"used_count"`
	ExpiryDate        *time.Time           `bson:"expiry_date,omitempty" json:"expiry_date,omitempty"` // null = no expiry
	IsActive          bool                 `bson:"is_active" json:"is_active"`
	CreatedAt         time.Time            `bson:"created_at" json:"created_at"`
}
