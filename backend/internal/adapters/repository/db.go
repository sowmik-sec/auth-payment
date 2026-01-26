package repository

import (
	"context"
	"fmt"
	"time"

	"auth-payment-backend/internal/adapters/config"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func NewMongoClient(cfg *config.Config) (*mongo.Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(cfg.DBUri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	// Ping the database
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to ping mongodb: %w", err)
	}

	return client, nil
}

func NewDatabase(client *mongo.Client, cfg *config.Config) *mongo.Database {
	return client.Database(cfg.DBName)
}
