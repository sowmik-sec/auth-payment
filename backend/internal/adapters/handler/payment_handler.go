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
	PlanID string `json:"plan_id" binding:"required"`
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

	clientSecret, err := h.service.InitiateCheckout(c.Request.Context(), userID, req.PlanID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"client_secret": clientSecret})
}

func (h *PaymentHandler) RegisterRoutes(router *gin.Engine, middleware gin.HandlerFunc) {
	payment := router.Group("/payment")
	payment.Use(middleware)
	{
		payment.POST("/checkout", h.InitiateCheckout)
	}
}
