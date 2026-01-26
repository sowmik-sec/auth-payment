package handler

import (
	"fmt"
	"net/http"

	"auth-payment-backend/internal/core/ports"

	"github.com/gin-gonic/gin"
)

type InvoiceHandler struct {
	service ports.InvoiceService
}

func NewInvoiceHandler(service ports.InvoiceService) *InvoiceHandler {
	return &InvoiceHandler{service: service}
}

func (h *InvoiceHandler) Generate(c *gin.Context) {
	txID := c.Param("txId")
	inv, err := h.service.GenerateInvoiceForTransaction(c.Request.Context(), txID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, inv)
}

func (h *InvoiceHandler) Download(c *gin.Context) {
	id := c.Param("id")
	pdfBytes, err := h.service.GetInvoicePDF(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invoice not found"})
		return
	}

	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=invoice-%s.txt", id))
	c.Data(http.StatusOK, "text/plain", pdfBytes)
}

func (h *InvoiceHandler) RegisterRoutes(router *gin.Engine, middleware gin.HandlerFunc) {
	inv := router.Group("/invoices")
	// inv.Use(middleware)
	{
		inv.POST("/generate/:txId", h.Generate)
		inv.GET("/:id/download", h.Download)
	}
}
