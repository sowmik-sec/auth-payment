package repository

import (
	"context"

	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/ports"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type MongoInvoiceRepository struct {
	invoices *mongo.Collection
}

func NewMongoInvoiceRepository(db *mongo.Database) ports.InvoiceRepository {
	return &MongoInvoiceRepository{
		invoices: db.Collection("invoices"),
	}
}

func (r *MongoInvoiceRepository) CreateInvoice(ctx context.Context, invoice *domain.Invoice) error {
	invoice.ID = primitive.NewObjectID()
	_, err := r.invoices.InsertOne(ctx, invoice)
	return err
}

func (r *MongoInvoiceRepository) GetInvoice(ctx context.Context, invoiceID primitive.ObjectID) (*domain.Invoice, error) {
	var inv domain.Invoice
	err := r.invoices.FindOne(ctx, bson.M{"_id": invoiceID}).Decode(&inv)
	return &inv, err
}

func (r *MongoInvoiceRepository) GetInvoicesByUser(ctx context.Context, userID primitive.ObjectID) ([]*domain.Invoice, error) {
	cursor, err := r.invoices.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	var invs []*domain.Invoice
	if err = cursor.All(ctx, &invs); err != nil {
		return nil, err
	}
	return invs, nil
}
