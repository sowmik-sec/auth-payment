package handler

import (
	"net/http"

	"auth-payment-backend/internal/core/ports"

	"github.com/gin-gonic/gin"
)

type AffiliateHandler struct {
	service ports.AffiliateService
}

func NewAffiliateHandler(service ports.AffiliateService) *AffiliateHandler {
	return &AffiliateHandler{service: service}
}

type createLinkRequest struct {
	ProgramID string `json:"program_id" binding:"required"`
	Code      string `json:"code" binding:"required"`
}

func (h *AffiliateHandler) CreateLink(c *gin.Context) {
	var req createLinkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := "650000000000000000000000" // Mock

	link, err := h.service.GenerateLink(c.Request.Context(), userID, req.ProgramID, req.Code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, link)
}

func (h *AffiliateHandler) GetStats(c *gin.Context) {
	userID := "650000000000000000000000" // Mock

	stats, err := h.service.GetMyStats(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// Temporary for testing: Create Program (usually Admin only)
type createProgramRequest struct {
	Rate float64 `json:"rate"`
}

func (h *AffiliateHandler) CreateProgram(c *gin.Context) {
	var req createProgramRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	creatorID := "650000000000000000000000"

	prog, err := h.service.CreateProgram(c.Request.Context(), creatorID, nil, req.Rate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, prog)
}

func (h *AffiliateHandler) RegisterRoutes(router *gin.Engine, middleware gin.HandlerFunc) {
	aff := router.Group("/affiliate")
	{
		aff.POST("/links", h.CreateLink)
		aff.GET("/stats", h.GetStats)
		aff.POST("/programs", h.CreateProgram) // Testing only
	}
}
