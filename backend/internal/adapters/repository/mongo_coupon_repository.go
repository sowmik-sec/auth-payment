package repository

import (
	"context"
	"errors"

	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/ports"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type MongoCouponRepository struct {
	collection *mongo.Collection
}

func NewMongoCouponRepository(db *mongo.Database) ports.CouponRepository {
	return &MongoCouponRepository{
		collection: db.Collection("coupons"),
	}
}

func (r *MongoCouponRepository) CreateCoupon(ctx context.Context, coupon *domain.Coupon) error {
	// Check if code exists
	count, err := r.collection.CountDocuments(ctx, bson.M{"code": coupon.Code})
	if err != nil {
		return err
	}
	if count > 0 {
		return errors.New("coupon code already exists")
	}

	result, err := r.collection.InsertOne(ctx, coupon)
	if err != nil {
		return err
	}
	coupon.ID = result.InsertedID.(primitive.ObjectID)
	return nil
}

func (r *MongoCouponRepository) GetCouponByCode(ctx context.Context, code string) (*domain.Coupon, error) {
	var coupon domain.Coupon
	err := r.collection.FindOne(ctx, bson.M{"code": code}).Decode(&coupon)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("coupon not found")
		}
		return nil, err
	}
	return &coupon, nil
}

func (r *MongoCouponRepository) GetCouponByID(ctx context.Context, id primitive.ObjectID) (*domain.Coupon, error) {
	var coupon domain.Coupon
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&coupon)
	if err != nil {
		return nil, err
	}
	return &coupon, nil
}

func (r *MongoCouponRepository) ListCoupons(ctx context.Context) ([]*domain.Coupon, error) {
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var coupons []*domain.Coupon
	if err = cursor.All(ctx, &coupons); err != nil {
		return nil, err
	}
	return coupons, nil
}

func (r *MongoCouponRepository) IncrementUsage(ctx context.Context, code string) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"code": code}, bson.M{"$inc": bson.M{"used_count": 1}})
	return err
}

func (r *MongoCouponRepository) UpdateCoupon(ctx context.Context, coupon *domain.Coupon) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": coupon.ID}, bson.M{"$set": coupon})
	return err
}

func (r *MongoCouponRepository) DeleteCoupon(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
