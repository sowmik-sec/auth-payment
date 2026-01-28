package services

import (
	"auth-payment-backend/internal/adapters/config"
	"auth-payment-backend/internal/core/ports"
	"context"
	"fmt"
	"net/url"

	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/account"
	"github.com/stripe/stripe-go/v76/loginlink"
	"github.com/stripe/stripe-go/v76/oauth"
)

type ConnectService struct {
	config   *config.Config
	userRepo ports.UserRepository
}

func NewConnectService(cfg *config.Config, userRepo ports.UserRepository) *ConnectService {
	return &ConnectService{
		config:   cfg,
		userRepo: userRepo,
	}
}

// GenerateOAuthURL builds the Stripe OAuth authorization URL for Express accounts
func (s *ConnectService) GenerateOAuthURL(userID string) string {
	clientID := s.config.StripeConnectClientID
	// backendCallbackURL := fmt.Sprintf("%s/stripe/connect/callback", s.config.FrontendURL) // Typically config.BackendURL if it existed
	backendCallbackURL := "http://localhost:8080/stripe/connect/callback" // TODO: Make configurable via config

	params := url.Values{}
	params.Add("response_type", "code")
	params.Add("client_id", clientID)
	params.Add("scope", "read_write")
	params.Add("state", userID) // Using userID as state for simplicity (CSRF protection recommended in prod)
	params.Add("redirect_uri", backendCallbackURL)

	return fmt.Sprintf("https://connect.stripe.com/oauth/authorize?%s", params.Encode())
}

// HandleOAuthCallback exchanges the authorization code for a connected account ID
func (s *ConnectService) HandleOAuthCallback(ctx context.Context, code string) (string, error) {
	params := &stripe.OAuthTokenParams{
		GrantType: stripe.String("authorization_code"),
		Code:      stripe.String(code),
	}

	token, err := oauth.New(params)
	if err != nil {
		return "", err
	}

	return token.StripeUserID, nil
}

// ConnectUser updates the user record with the connected account ID
func (s *ConnectService) ConnectUser(ctx context.Context, userID string, connectID string) error {
	return s.userRepo.UpdateStripeConnect(ctx, userID, connectID, "active")
}

// GetConnectionStatus checks if the user has a connected account
func (s *ConnectService) GetConnectionStatus(ctx context.Context, userID string) (map[string]interface{}, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	connected := user.StripeConnectID != ""
	return map[string]interface{}{
		"connected":         boundBool(connected),
		"stripe_connect_id": user.StripeConnectID,
		"status":            user.StripeConnectStatus,
	}, nil
}

func boundBool(b bool) bool {
	return b
}

// CreateDashboardLoginLink generates a single-use login link for the Express dashboard
func (s *ConnectService) CreateDashboardLoginLink(ctx context.Context, connectID string) (string, error) {
	// First, fetch the account to check its type
	acc, err := account.GetByID(connectID, nil)
	if err != nil {
		return "", err
	}

	// Standard accounts cannot use login links. They log in directly to Stripe.
	if acc.Type == stripe.AccountTypeStandard {
		return "https://dashboard.stripe.com/", nil
	}

	// For Express/Custom accounts, use Login Link
	params := &stripe.LoginLinkParams{
		Account: stripe.String(connectID),
	}

	link, err := loginlink.New(params)
	if err != nil {
		return "", err
	}

	return link.URL, nil
}

// CreateAccountLink creates an onboarding link (if account exists but not fully onboarded)
// Useful if we create the account first via API then redirect.
// But in OAuth flow, account is created during OAuth.
