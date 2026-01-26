package services

import (
	"context"
	"errors"

	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/ports"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	repo         ports.UserRepository
	tokenService *TokenService
}

func NewAuthService(repo ports.UserRepository, tokenService *TokenService) ports.AuthService {
	return &AuthService{
		repo:         repo,
		tokenService: tokenService,
	}
}

func (s *AuthService) Register(ctx context.Context, email, password, fullName string) (*domain.User, error) {
	existingUser, err := s.repo.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return nil, errors.New("email already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &domain.User{
		Email:    email,
		Password: string(hashedPassword),
		FullName: fullName,
	}

	if err := s.repo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) Login(ctx context.Context, email, password string) (string, string, error) {
	user, err := s.repo.GetByEmail(ctx, email)
	if err != nil {
		return "", "", err
	}
	if user == nil {
		return "", "", errors.New("invalid credentials")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", "", errors.New("invalid credentials")
	}

	return s.tokenService.GenerateTokens(user)
}

func (s *AuthService) RefreshToken(ctx context.Context, refreshToken string) (string, string, error) {
	claims, err := s.tokenService.ValidateToken(refreshToken)
	if err != nil {
		return "", "", err
	}

	if claims.Type != "refresh" {
		return "", "", errors.New("invalid token type")
	}

	user, err := s.repo.GetByID(ctx, claims.UserID)
	if err != nil {
		return "", "", err
	}
	if user == nil {
		return "", "", errors.New("user not found")
	}

	// In a real implementation, we should check if the refresh token is revoked or reused.
	// For this MVP, we just issue new tokens.

	return s.tokenService.GenerateTokens(user)
}

func (s *AuthService) ValidateToken(tokenString string) (*domain.User, error) {
	claims, err := s.tokenService.ValidateToken(tokenString)
	if err != nil {
		return nil, err
	}

	// Use background context as a fallback because the interface method doesn't accept context
	return s.repo.GetByID(context.Background(), claims.UserID)
}
