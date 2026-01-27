package handler

import (
	"net/http"

	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/ports"

	"github.com/gin-gonic/gin"
)

type PricingHandler struct {
	service ports.PricingService
}

func NewPricingHandler(service ports.PricingService) *PricingHandler {
	return &PricingHandler{service: service}
}

// CreatePlan endpoints
func (h *PricingHandler) CreatePlan(c *gin.Context) {
	var plan domain.PricingPlan
	if err := c.ShouldBindJSON(&plan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Get CreatorID from context (Auth Middleware)
	// plan.CreatorID = ...

	if err := h.service.CreatePlan(c.Request.Context(), &plan); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, plan)
}

// ListPlans endpoints
func (h *PricingHandler) ListPlans(c *gin.Context) {
	productID := c.Query("productId")
	var pIDPtr *string
	if productID != "" {
		pIDPtr = &productID
	}

	plans, err := h.service.ListPlans(c.Request.Context(), pIDPtr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, plans)
}

// GetPlan endpoint
func (h *PricingHandler) GetPlan(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "plan ID is required"})
		return
	}

	plan, err := h.service.GetPlan(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if plan == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "plan not found"})
		return
	}

	c.JSON(http.StatusOK, plan)
}

func (h *PricingHandler) RegisterRoutes(router *gin.Engine, middleware gin.HandlerFunc) {
	pricing := router.Group("/pricing")
	{
		// Public or Protected? Let's make List public, Create protected
		pricing.GET("/plans", h.ListPlans)
		pricing.GET("/plans/:id", h.GetPlan)

		// Protected
		pricing.POST("/plans", h.CreatePlan)
	}

	// Admin routes
	admin := router.Group("/admin")
	admin.Use(middleware)
	{
		admin.POST("/plans", h.CreatePlan)
	}
}
