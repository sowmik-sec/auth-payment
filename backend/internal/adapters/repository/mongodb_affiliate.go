package repository

import (
	"context"

	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/ports"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type MongoAffiliateRepository struct {
	programs    *mongo.Collection
	links       *mongo.Collection
	commissions *mongo.Collection
}

func NewMongoAffiliateRepository(db *mongo.Database) ports.AffiliateRepository {
	return &MongoAffiliateRepository{
		programs:    db.Collection("affiliate_programs"),
		links:       db.Collection("affiliate_links"),
		commissions: db.Collection("affiliate_commissions"),
	}
}

// --- Program ---
func (r *MongoAffiliateRepository) CreateProgram(ctx context.Context, program *domain.AffiliateProgram) error {
	program.ID = primitive.NewObjectID()
	_, err := r.programs.InsertOne(ctx, program)
	return err
}

func (r *MongoAffiliateRepository) GetProgram(ctx context.Context, id primitive.ObjectID) (*domain.AffiliateProgram, error) {
	var p domain.AffiliateProgram
	err := r.programs.FindOne(ctx, bson.M{"_id": id}).Decode(&p)
	return &p, err
}

func (r *MongoAffiliateRepository) GetGlobalProgram(ctx context.Context, creatorID primitive.ObjectID) (*domain.AffiliateProgram, error) {
	var p domain.AffiliateProgram
	// Assuming product_id nil means global
	err := r.programs.FindOne(ctx, bson.M{"creator_id": creatorID, "product_id": nil}).Decode(&p)
	return &p, err
}

// --- Links ---
func (r *MongoAffiliateRepository) CreateLink(ctx context.Context, link *domain.AffiliateLink) error {
	link.ID = primitive.NewObjectID()
	_, err := r.links.InsertOne(ctx, link)
	return err
}

func (r *MongoAffiliateRepository) GetLinkByCode(ctx context.Context, code string) (*domain.AffiliateLink, error) {
	var l domain.AffiliateLink
	err := r.links.FindOne(ctx, bson.M{"code": code}).Decode(&l)
	return &l, err
}

func (r *MongoAffiliateRepository) GetLinksByUser(ctx context.Context, userID primitive.ObjectID) ([]*domain.AffiliateLink, error) {
	cursor, err := r.links.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	var links []*domain.AffiliateLink
	if err = cursor.All(ctx, &links); err != nil {
		return nil, err
	}
	return links, nil
}

func (r *MongoAffiliateRepository) RecordClick(ctx context.Context, linkID primitive.ObjectID) error {
	_, err := r.links.UpdateOne(ctx, bson.M{"_id": linkID}, bson.M{"$inc": bson.M{"clicks": 1}})
	return err
}

// --- Commissions ---
func (r *MongoAffiliateRepository) CreateCommission(ctx context.Context, comm *domain.Commission) error {
	comm.ID = primitive.NewObjectID()
	_, err := r.commissions.InsertOne(ctx, comm)
	return err
}

func (r *MongoAffiliateRepository) GetCommissionsByUser(ctx context.Context, userID primitive.ObjectID) ([]*domain.Commission, error) {
	cursor, err := r.commissions.Find(ctx, bson.M{"affiliate_user_id": userID})
	if err != nil {
		return nil, err
	}
	var comms []*domain.Commission
	if err = cursor.All(ctx, &comms); err != nil {
		return nil, err
	}
	return comms, nil
}
