package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// PricingType defines the supported pricing models
type PricingType string

const (
	PricingTypeOneTime      PricingType = "one_time"
	PricingTypeSubscription PricingType = "subscription"
	PricingTypeSplit        PricingType = "split"
	PricingTypeTiered       PricingType = "tiered"
	PricingTypeDonation     PricingType = "donation"
	PricingTypeBundle       PricingType = "bundle"
)

// RecurringInterval defines the billing cycle for subscriptions
type RecurringInterval string

const (
	IntervalMonthly RecurringInterval = "month"
	IntervalYearly  RecurringInterval = "year"
	IntervalWeekly  RecurringInterval = "week"
	IntervalDaily   RecurringInterval = "day"
)

// PricingPlan represents a polymorphic pricing configuration for a product
type PricingPlan struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ProductID    primitive.ObjectID `bson:"product_id" json:"product_id"`
	CreatorID    primitive.ObjectID `bson:"creator_id" json:"creator_id"`
	Name         string             `bson:"name" json:"name"`
	Description  string             `bson:"description" json:"description"`
	Type         PricingType        `bson:"type" json:"type"`
	IsActive     bool               `bson:"is_active" json:"is_active"`
	Values       []string           `bson:"values" json:"values"` // List of benefits/features
	AllowCoupons bool               `bson:"allow_coupons" json:"allow_coupons"`
	IsFree       bool               `bson:"is_free" json:"is_free"`
	IsPrivate    bool               `bson:"is_private" json:"is_private"`

	// Stripe Sync
	StripeProductID string `bson:"stripe_product_id,omitempty" json:"stripe_product_id,omitempty"`
	StripePriceID   string `bson:"stripe_price_id,omitempty" json:"stripe_price_id,omitempty"`

	// Type-Specific Configurations (Polymorphic)
	OneTimeConfig      *OneTimeConfig      `bson:"one_time_config,omitempty" json:"one_time_config,omitempty"`
	SubscriptionConfig *SubscriptionConfig `bson:"subscription_config,omitempty" json:"subscription_config,omitempty"`
	SplitConfig        *SplitConfig        `bson:"split_config,omitempty" json:"split_config,omitempty"`
	TieredConfig       *TieredConfig       `bson:"tiered_config,omitempty" json:"tiered_config,omitempty"`
	DonationConfig     *DonationConfig     `bson:"donation_config,omitempty" json:"donation_config,omitempty"`
	BundleConfig       *BundleConfig       `bson:"bundle_config,omitempty" json:"bundle_config,omitempty"`

	// Constraints
	LimitedSell    *LimitedSellConfig `bson:"limited_sell,omitempty" json:"limited_sell,omitempty"`
	EarlyBird      *EarlyBirdConfig   `bson:"early_bird,omitempty" json:"early_bird,omitempty"`
	AccessDuration *AccessConfig      `bson:"access_duration,omitempty" json:"access_duration,omitempty"` // null = lifetime
	UpsellConfig   *UpsellConfig      `bson:"upsell_config,omitempty" json:"upsell_config,omitempty"`

	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}

// --- Specific Configurations ---

type OneTimeConfig struct {
	Price         float64 `bson:"price" json:"price"`
	OriginalPrice float64 `bson:"original_price,omitempty" json:"original_price,omitempty"`
	Currency      string  `bson:"currency" json:"currency"`
}

type SubscriptionConfig struct {
	Price             float64           `bson:"price" json:"price"`
	OriginalPrice     float64           `bson:"original_price,omitempty" json:"original_price,omitempty"`
	SetupFee          float64           `bson:"setup_fee,omitempty" json:"setup_fee,omitempty"`
	Currency          string            `bson:"currency" json:"currency"`
	Interval          RecurringInterval `bson:"interval" json:"interval"`
	TrialDays         int               `bson:"trial_days,omitempty" json:"trial_days,omitempty"`
	TrialRequiresCard bool              `bson:"trial_requires_card" json:"trial_requires_card"`
}

type SplitConfig struct {
	TotalAmount      float64           `bson:"total_amount" json:"total_amount"`
	OriginalPrice    float64           `bson:"original_price,omitempty" json:"original_price,omitempty"`
	Currency         string            `bson:"currency" json:"currency"`
	InstallmentCount int               `bson:"installment_count" json:"installment_count"`
	Interval         RecurringInterval `bson:"interval" json:"interval"` // e.g., Monthly
	UpfrontPayment   float64           `bson:"upfront_payment,omitempty" json:"upfront_payment,omitempty"`
}

type TieredConfig struct {
	Tiers []TierItem `bson:"tiers" json:"tiers"`
}

type TierItem struct {
	Name      string  `bson:"name" json:"name"`
	MinQty    int     `bson:"min_qty" json:"min_qty"`
	MaxQty    int     `bson:"max_qty" json:"max_qty"` // -1 for unlimited
	UnitPrice float64 `bson:"unit_price" json:"unit_price"`
}

type DonationConfig struct {
	MinAmount       float64 `bson:"min_amount" json:"min_amount"`
	SuggestedAmount float64 `bson:"suggested_amount,omitempty" json:"suggested_amount,omitempty"`
	Currency        string  `bson:"currency" json:"currency"`
}

type BundleConfig struct {
	Price              float64              `bson:"price" json:"price"`
	OriginalPrice      float64              `bson:"original_price,omitempty" json:"original_price,omitempty"`
	IncludedProductIDs []primitive.ObjectID `bson:"included_product_ids" json:"included_product_ids"`
}

type UpsellConfig struct {
	UpsellProductIDs []primitive.ObjectID `bson:"upsell_product_ids" json:"upsell_product_ids"`
}

// --- Constraints ---

type LimitedSellConfig struct {
	MaxQuantity int `bson:"max_quantity" json:"max_quantity"`
	SoldCount   int `bson:"sold_count" json:"sold_count"`
}

type EarlyBirdConfig struct {
	DiscountAmount float64   `bson:"discount_amount" json:"discount_amount"` // OR Percentage? Stick to fixed for now or add Type
	Deadline       time.Time `bson:"deadline" json:"deadline"`
}

type AccessConfig struct {
	DurationDays int `bson:"duration_days" json:"duration_days"`
}
