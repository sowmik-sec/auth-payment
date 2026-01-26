package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PaymentStatus string

const (
	PaymentStatusPending           PaymentStatus = "pending"
	PaymentStatusSucceeded         PaymentStatus = "succeeded"
	PaymentStatusFailed            PaymentStatus = "failed"
	PaymentStatusRefunded          PaymentStatus = "refunded"
	PaymentStatusPartiallyRefunded PaymentStatus = "partially_refunded"
)

type PaymentGateway string

const (
	GatewayStripe PaymentGateway = "stripe"
	GatewayPaypal PaymentGateway = "paypal"
	GatewayManual PaymentGateway = "manual"
)

// Payment represents a single financial transaction
type Payment struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID        primitive.ObjectID `bson:"user_id" json:"user_id"`       // Buyer
	CreatorID     primitive.ObjectID `bson:"creator_id" json:"creator_id"` // Seller
	PricingPlanID primitive.ObjectID `bson:"pricing_plan_id" json:"pricing_plan_id"`
	MembershipID  primitive.ObjectID `bson:"membership_id" json:"membership_id"`

	Amount   float64        `bson:"amount" json:"amount"`
	Currency string         `bson:"currency" json:"currency"`
	Status   PaymentStatus  `bson:"status" json:"status"`
	Gateway  PaymentGateway `bson:"gateway" json:"gateway"`

	// Gateway specific details
	TransactionID string            `bson:"transaction_id" json:"transaction_id"` // e.g. Stripe PaymentIntent ID
	Metadata      map[string]string `bson:"metadata" json:"metadata"`

	// Affiliate Tracking
	AffiliateID *primitive.ObjectID `bson:"affiliate_id,omitempty" json:"affiliate_id,omitempty"`
	Commission  float64             `bson:"commission,omitempty" json:"commission,omitempty"`

	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}

// Subscription represents a recurring billing agreement
type Subscription struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID        primitive.ObjectID `bson:"user_id" json:"user_id"`
	PricingPlanID primitive.ObjectID `bson:"pricing_plan_id" json:"pricing_plan_id"`

	StripeSubID string `bson:"stripe_subscription_id" json:"stripe_subscription_id"`
	Status      string `bson:"status" json:"status"` // active, past_due, canceled

	CurrentPeriodStart time.Time `bson:"current_period_start" json:"current_period_start"`
	CurrentPeriodEnd   time.Time `bson:"current_period_end" json:"current_period_end"`
	CancelAtPeriodEnd  bool      `bson:"cancel_at_period_end" json:"cancel_at_period_end"`

	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}
