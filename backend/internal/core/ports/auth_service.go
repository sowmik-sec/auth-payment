package ports

import (
	"auth-payment-backend/internal/core/domain"
	"context"
)

type AuthService interface {
	Register(ctx context.Context, email, password, fullName string) (*domain.User, error)
	Login(ctx context.Context, email, password string) (string, string, error) // Returns accessToken, refreshToken, error
	RefreshToken(ctx context.Context, refreshToken string) (string, string, error)
	ValidateToken(tokenString string) (*domain.User, error)
	// Add ForgotPassword, ResetPassword, etc. later
}
