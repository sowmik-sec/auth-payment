package handler

import (
	"net/http"

	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/ports"

	"github.com/gin-gonic/gin"
)

type WalletHandler struct {
	service ports.WalletService
}

func NewWalletHandler(service ports.WalletService) *WalletHandler {
	return &WalletHandler{service: service}
}

func (h *WalletHandler) GetBalance(c *gin.Context) {
	// In real app, get from middleware
	// user := c.MustGet("user").(*domain.User)
	// userID := user.ID.Hex()
	userID := "650000000000000000000000" // Mock

	wallet, err := h.service.GetBalance(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, wallet)
}

func (h *WalletHandler) GetTransactions(c *gin.Context) {
	userID := "650000000000000000000000" // Mock

	txs, err := h.service.GetTransactions(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, txs)
}

type payoutRequestBody struct {
	Amount float64 `json:"amount" binding:"required,gt=0"`
	Method string  `json:"method" binding:"required"`
}

func (h *WalletHandler) RequestPayout(c *gin.Context) {
	var req payoutRequestBody
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := "650000000000000000000000" // Mock

	err := h.service.RequestPayout(c.Request.Context(), userID, req.Amount, domain.PayoutMethod(req.Method))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payout requested successfully"})
}

func (h *WalletHandler) RegisterRoutes(router *gin.Engine, middleware gin.HandlerFunc) {
	wallet := router.Group("/wallet")
	// wallet.Use(middleware) // Enable auth
	{
		wallet.GET("/balance", h.GetBalance)
		wallet.GET("/transactions", h.GetTransactions)
		wallet.POST("/payouts", h.RequestPayout)
	}
}
