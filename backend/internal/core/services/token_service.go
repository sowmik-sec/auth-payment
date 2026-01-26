package services

import (
	"errors"
	"time"

	"auth-payment-backend/internal/adapters/config"
	"auth-payment-backend/internal/core/domain"

	"github.com/golang-jwt/jwt/v5"
)

type TokenService struct {
	config *config.Config
}

func NewTokenService(cfg *config.Config) *TokenService {
	return &TokenService{config: cfg}
}

type MyCustomClaims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Type   string `json:"type"` // "access" or "refresh"
	jwt.RegisteredClaims
}

func (s *TokenService) GenerateTokens(user *domain.User) (string, string, error) {
	// Access Token
	claims := MyCustomClaims{
		user.ID.Hex(),
		user.Email,
		"access",
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "auth-backend",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessToken, err := token.SignedString([]byte(s.config.JWTSecret))
	if err != nil {
		return "", "", err
	}

	// Refresh Token
	refreshClaims := MyCustomClaims{
		user.ID.Hex(),
		user.Email,
		"refresh",
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)), // 7 days
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "auth-backend",
		},
	}
	refreshTokenObj := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshToken, err := refreshTokenObj.SignedString([]byte(s.config.JWTSecret))
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func (s *TokenService) ValidateToken(tokenString string) (*MyCustomClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &MyCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.config.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*MyCustomClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
