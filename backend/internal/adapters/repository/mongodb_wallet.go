package repository

import (
	"context"

	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/ports"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoWalletRepository struct {
	wallets      *mongo.Collection
	transactions *mongo.Collection
	payouts      *mongo.Collection
}

func NewMongoWalletRepository(db *mongo.Database) ports.WalletRepository {
	return &MongoWalletRepository{
		wallets:      db.Collection("wallets"),
		transactions: db.Collection("wallet_transactions"),
		payouts:      db.Collection("payout_requests"),
	}
}

// --- Wallet ---

func (r *MongoWalletRepository) CreateWallet(ctx context.Context, wallet *domain.Wallet) error {
	wallet.ID = primitive.NewObjectID()
	_, err := r.wallets.InsertOne(ctx, wallet)
	return err
}

func (r *MongoWalletRepository) GetWalletByUserID(ctx context.Context, userID primitive.ObjectID) (*domain.Wallet, error) {
	var wallet domain.Wallet
	err := r.wallets.FindOne(ctx, bson.M{"user_id": userID}).Decode(&wallet)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // Caller handles creation if needed
		}
		return nil, err
	}
	return &wallet, nil
}

func (r *MongoWalletRepository) GetWalletByID(ctx context.Context, walletID primitive.ObjectID) (*domain.Wallet, error) {
	var wallet domain.Wallet
	err := r.wallets.FindOne(ctx, bson.M{"_id": walletID}).Decode(&wallet)
	if err != nil {
		return nil, err
	}
	return &wallet, nil
}

func (r *MongoWalletRepository) UpdateBalance(ctx context.Context, walletID primitive.ObjectID, newBalance float64) error {
	_, err := r.wallets.UpdateOne(ctx, bson.M{"_id": walletID}, bson.M{
		"$set": bson.M{"balance": newBalance, "updated_at": primitive.NewDateTimeFromTime(primitive.NewObjectID().Timestamp())},
	})
	return err
}

// --- Transactions ---

func (r *MongoWalletRepository) CreateTransaction(ctx context.Context, tx *domain.WalletTransaction) error {
	tx.ID = primitive.NewObjectID()
	_, err := r.transactions.InsertOne(ctx, tx)
	return err
}

func (r *MongoWalletRepository) GetTransactions(ctx context.Context, walletID primitive.ObjectID) ([]*domain.WalletTransaction, error) {
	opts := options.Find().SetSort(bson.M{"created_at": -1})
	cursor, err := r.transactions.Find(ctx, bson.M{"wallet_id": walletID}, opts)
	if err != nil {
		return nil, err
	}
	var txs []*domain.WalletTransaction
	if err = cursor.All(ctx, &txs); err != nil {
		return nil, err
	}
	return txs, nil
}

// --- Payouts ---

func (r *MongoWalletRepository) CreatePayoutRequest(ctx context.Context, req *domain.PayoutRequest) error {
	req.ID = primitive.NewObjectID()
	_, err := r.payouts.InsertOne(ctx, req)
	return err
}

func (r *MongoWalletRepository) GetPayoutsByUserID(ctx context.Context, userID primitive.ObjectID) ([]*domain.PayoutRequest, error) {
	cursor, err := r.payouts.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	var reqs []*domain.PayoutRequest
	if err = cursor.All(ctx, &reqs); err != nil {
		return nil, err
	}
	return reqs, nil
}

func (r *MongoWalletRepository) GetPendingPayouts(ctx context.Context) ([]*domain.PayoutRequest, error) {
	cursor, err := r.payouts.Find(ctx, bson.M{"status": domain.PayoutStatusPending})
	if err != nil {
		return nil, err
	}
	var reqs []*domain.PayoutRequest
	if err = cursor.All(ctx, &reqs); err != nil {
		return nil, err
	}
	return reqs, nil
}

func (r *MongoWalletRepository) UpdatePayoutStatus(ctx context.Context, payoutID primitive.ObjectID, status domain.PayoutStatus) error {
	_, err := r.payouts.UpdateOne(ctx, bson.M{"_id": payoutID}, bson.M{"$set": bson.M{"status": status}})
	return err
}
