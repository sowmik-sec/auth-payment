package handler

import (
	"auth-payment-backend/internal/core/domain"
	"auth-payment-backend/internal/core/ports"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CouponHandler struct {
	service ports.CouponService
}

func NewCouponHandler(service ports.CouponService) *CouponHandler {
	return &CouponHandler{service: service}
}

func (h *CouponHandler) CreateCoupon(c *gin.Context) {
	var coupon domain.Coupon
	if err := c.ShouldBindJSON(&coupon); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.CreateCoupon(c.Request.Context(), &coupon); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, coupon)
}

func (h *CouponHandler) ListCoupons(c *gin.Context) {
	coupons, err := h.service.ListCoupons(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, coupons)
}

func (h *CouponHandler) ValidateCoupon(c *gin.Context) {
	var req struct {
		Code   string `json:"code"`
		PlanID string `json:"plan_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	coupon, discount, err := h.service.ValidateCoupon(c.Request.Context(), req.Code, req.PlanID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"coupon":   coupon,
		"discount": discount,
	})
}
