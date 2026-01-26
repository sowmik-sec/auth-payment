package repository

import (
	"context"

	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/ports"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type MongoPricingRepository struct {
	collection *mongo.Collection
}

func NewMongoPricingRepository(db *mongo.Database) ports.PricingRepository {
	return &MongoPricingRepository{
		collection: db.Collection("pricing_plans"),
	}
}

func (r *MongoPricingRepository) CreatePlan(ctx context.Context, plan *domain.PricingPlan) error {
	plan.ID = primitive.NewObjectID()
	_, err := r.collection.InsertOne(ctx, plan)
	return err
}

func (r *MongoPricingRepository) GetPlanByID(ctx context.Context, id primitive.ObjectID) (*domain.PricingPlan, error) {
	var plan domain.PricingPlan
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&plan)
	if err != nil {
		return nil, err
	}
	return &plan, nil
}

func (r *MongoPricingRepository) GetPlansByProductID(ctx context.Context, productID primitive.ObjectID) ([]*domain.PricingPlan, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"product_id": productID})
	if err != nil {
		return nil, err
	}
	var plans []*domain.PricingPlan
	if err = cursor.All(ctx, &plans); err != nil {
		return nil, err
	}
	return plans, nil
}

func (r *MongoPricingRepository) UpdatePlan(ctx context.Context, plan *domain.PricingPlan) error {
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": plan.ID}, plan)
	return err
}

func (r *MongoPricingRepository) DeletePlan(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
