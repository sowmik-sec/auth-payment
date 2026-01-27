package handler

import (
	"net/http"

	"auth-payment-backend/internal/core/services"

	"github.com/gin-gonic/gin"
)

type PaymentHandler struct {
	service *services.PaymentServiceImpl
}

func NewPaymentHandler(service *services.PaymentServiceImpl) *PaymentHandler {
	return &PaymentHandler{service: service}
}

type checkoutRequest struct {
	PlanID        string  `json:"plan_id" binding:"required"`
	AffiliateCode string  `json:"affiliate_code"`
	CouponCode    string  `json:"coupon_code"` // Added
	Amount        float64 `json:"amount"`      // For Donation
	Quantity      int     `json:"quantity"`    // For Tiered
	TierIndex     int     `json:"tier_index"`  // For Tiered
}

func (h *PaymentHandler) InitiateCheckout(c *gin.Context) {
	var req checkoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get User from Auth Middleware
	// metadata, _ := c.Get("user")
	// userID := metadata.(*domain.User).ID.Hex()
	userID := "650000000000000000000000" // Mock for now until Auth is fully verified in this context

	// Pass dynamic args to service
	clientSecret, err := h.service.InitiateCheckout(c.Request.Context(), userID, req.PlanID, req.AffiliateCode, req.CouponCode, req.Amount, req.Quantity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"client_secret": clientSecret})
}

// MockWebhookRequest for testing E2E without real Stripe
type MockWebhookRequest struct {
	Amount   float64           `json:"amount"`
	Currency string            `json:"currency"`
	Metadata map[string]string `json:"metadata"`
}

func (h *PaymentHandler) MockWebhookSuccess(c *gin.Context) {
	var req MockWebhookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.service.ProcessPaymentSuccess(c.Request.Context(), req.Amount, req.Currency, req.Metadata)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "processed"})
}

func (h *PaymentHandler) RegisterRoutes(router *gin.Engine, middleware gin.HandlerFunc) {
	payment := router.Group("/payment")
	payment.Use(middleware)
	{
		payment.POST("/checkout", h.InitiateCheckout)
		payment.POST("/webhook/mock", h.MockWebhookSuccess) // Test endpoint
	}
}
