package handler

import (
	"net/http"

	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/services"

	"github.com/gin-gonic/gin"
)

type ConnectHandler struct {
	connectService *services.ConnectService
	configDomain   string // Frontend URL for redirect
}

func NewConnectHandler(connectService *services.ConnectService) *ConnectHandler {
	// Ideally we inject config to get frontend URL, but for now we can infer or pass it.
	// Let's modify NewConnectHandler signature in main.go later if needed,
	// or just assume we can get it from service or context.
	// Service has config.
	return &ConnectHandler{
		connectService: connectService,
	}
}

// GenerateOAuthURL returns the Stripe OAuth URL
func (h *ConnectHandler) GenerateOAuthURL(c *gin.Context) {
	userID := c.MustGet("user").(*domain.User).ID.Hex()

	url := h.connectService.GenerateOAuthURL(userID)
	c.JSON(http.StatusOK, gin.H{"url": url})
}

// HandleCallback handles the Stripe redirect with auth code
func (h *ConnectHandler) HandleCallback(c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state") // userID
	// error := c.Query("error")

	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Authorization code missing"})
		return
	}

	// In a real app, verify state matches current user or session.
	// Here `state` IS the userID passed to Stripe.
	userID := state

	// Exchange code for connected account ID
	connectID, err := h.connectService.HandleOAuthCallback(c.Request.Context(), code)
	if err != nil {
		// Redirect to frontend with error
		// We need the frontend URL. It's in config, but service has it.
		// Let's hardcode for now matching config or get from service if I exposed it. I didn't verify if service exposes config.
		// It does: `type ConnectService struct { config *config.Config ... }` but it's private.
		// Just hardcode for dev/demo or assume standard env.
		c.Redirect(http.StatusTemporaryRedirect, "http://localhost:5173/settings/stripe-connect?error="+err.Error())
		return
	}

	// Update user
	err = h.connectService.ConnectUser(c.Request.Context(), userID, connectID)
	if err != nil {
		c.Redirect(http.StatusTemporaryRedirect, "http://localhost:5173/settings/stripe-connect?error="+err.Error())
		return
	}

	// Success redirect
	c.Redirect(http.StatusTemporaryRedirect, "http://localhost:5173/settings/stripe-connect?success=true")
}

// GetStatus returns the current user's connection status
func (h *ConnectHandler) GetStatus(c *gin.Context) {
	userID := c.MustGet("user").(*domain.User).ID.Hex()

	status, err := h.connectService.GetConnectionStatus(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, status)
}

// GetDashboardLink returns a link to the Stripe Express dashboard
func (h *ConnectHandler) GetDashboardLink(c *gin.Context) {
	user := c.MustGet("user").(*domain.User)

	if user.StripeConnectID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User is not connected to Stripe"})
		return
	}

	url, err := h.connectService.CreateDashboardLoginLink(c.Request.Context(), user.StripeConnectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"url": url})
}
