package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID                  primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email               string             `bson:"email" json:"email"`
	Password            string             `bson:"password" json:"-"` // Never return password in JSON
	FullName            string             `bson:"full_name" json:"full_name"`
	IsEmailVerified     bool               `bson:"is_email_verified" json:"is_email_verified"`
	StripeCustomerID    string             `bson:"stripe_customer_id,omitempty" json:"stripe_customer_id,omitempty"`
	StripeConnectID     string             `bson:"stripe_connect_id,omitempty" json:"stripe_connect_id,omitempty"`
	StripeConnectStatus string             `bson:"stripe_connect_status,omitempty" json:"stripe_connect_status,omitempty"` // "pending", "active", "disabled"
	CreatedAt           time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt           time.Time          `bson:"updated_at" json:"updated_at"`
}

// Helper methods for User can go here (e.g., domain logic)
