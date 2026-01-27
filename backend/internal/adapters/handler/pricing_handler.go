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
		admin.PUT("/plans/:id", h.UpdatePlan)
		admin.DELETE("/plans/:id", h.DeletePlan)
	}
}

// UpdatePlan endpoint
func (h *PricingHandler) UpdatePlan(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "plan ID is required"})
		return
	}

	var req struct {
		Name        string   `json:"name" binding:"required"`
		Description string   `json:"description"`
		Price       *float64 `json:"price"`
		Interval    *string  `json:"interval"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.UpdatePlan(c.Request.Context(), id, req.Name, req.Description, req.Price, req.Interval); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "updated"})
}

// DeletePlan endpoint
func (h *PricingHandler) DeletePlan(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "plan ID is required"})
		return
	}

	if err := h.service.DeletePlan(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "deleted"})
}
