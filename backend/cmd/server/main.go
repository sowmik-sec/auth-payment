package main

import (
	"context"
	"log"
	"net/http"

	"auth-payment-backend/internal/adapters/config"
	"auth-payment-backend/internal/adapters/handler"
	"auth-payment-backend/internal/adapters/middleware"
	sys_payment "auth-payment-backend/internal/adapters/payment/stripe"
	"auth-payment-backend/internal/adapters/repository"
	"auth-payment-backend/internal/core/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.uber.org/fx"
)

func main() {
	app := fx.New(
		fx.Provide(
			config.LoadConfig,
			repository.NewMongoClient,
			repository.NewDatabase,
			repository.NewMongoUserRepository,
			repository.NewMongoPricingRepository,
			repository.NewMongoWalletRepository, // Added
			// Affiliate Deps
			// Affiliate Deps
			repository.NewMongoAffiliateRepository,
			repository.NewMongoInvoiceRepository,
			repository.NewMongoCouponRepository, // Added

			// Payment Deps
			sys_payment.NewStripeAdapter,
			services.NewPaymentService,
			services.NewWalletService,
			services.NewAffiliateService,
			services.NewInvoiceService,

			handler.NewPaymentHandler,
			handler.NewWalletHandler,

			handler.NewAffiliateHandler,
			handler.NewConnectHandler, // Added

			handler.NewInvoiceHandler,
			handler.NewCouponHandler, // Added

			services.NewTokenService,
			services.NewAuthService,
			services.NewPricingService,
			services.NewCouponService,  // Added
			services.NewConnectService, // Added
			handler.NewAuthHandler,
			handler.NewPricingHandler,
			middleware.NewAuthMiddleware,
			NewGinRouter,
		),
		fx.Invoke(
			RegisterRoutes,
			StartServer,
		),
	)

	app.Run()
}

func NewGinRouter() *gin.Engine {
	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowCredentials = true

	r.Use(cors.New(config))

	return r
}

func RegisterRoutes(router *gin.Engine, authHandler *handler.AuthHandler, pricingHandler *handler.PricingHandler, paymentHandler *handler.PaymentHandler, walletHandler *handler.WalletHandler, affiliateHandler *handler.AffiliateHandler, invoiceHandler *handler.InvoiceHandler, couponHandler *handler.CouponHandler, connectHandler *handler.ConnectHandler, authMiddleware *middleware.AuthMiddleware) {
	authHandler.RegisterRoutes(router, authMiddleware.Protect())
	pricingHandler.RegisterRoutes(router, authMiddleware.Protect())
	paymentHandler.RegisterRoutes(router, authMiddleware.Protect())
	walletHandler.RegisterRoutes(router, authMiddleware.Protect())
	affiliateHandler.RegisterRoutes(router, authMiddleware.Protect())
	invoiceHandler.RegisterRoutes(router, authMiddleware.Protect())

	// Coupon Routes
	couponGroup := router.Group("/coupons")
	couponGroup.Use(authMiddleware.Protect())
	{
		couponGroup.POST("", couponHandler.CreateCoupon)
		couponGroup.GET("", couponHandler.ListCoupons)
		couponGroup.POST("/validate", couponHandler.ValidateCoupon) // Public? Maybe allow without auth if guest checkout? For now protected.
	}

	// Stripe Connect Routes
	connectGroup := router.Group("/stripe/connect")
	// callback is public or authenticated?
	// The callback comes from Stripe browser redirect. It doesn't have the Bearer token in header usually!
	// But we are using `state` = userID.
	// We can't rely on AuthMiddleware for callback unless we pass token in state/cookie.
	// So HandleCallback must be PUBLIC (no middleware), but secure via state check.
	connectGroup.GET("/callback", connectHandler.HandleCallback)

	// Protected routes
	protectedConnect := connectGroup.Use(authMiddleware.Protect())
	{
		protectedConnect.GET("/oauth", connectHandler.GenerateOAuthURL)
		protectedConnect.GET("/status", connectHandler.GetStatus)
		protectedConnect.POST("/dashboard", connectHandler.GetDashboardLink)
	}
}

func StartServer(lc fx.Lifecycle, cfg *config.Config, router *gin.Engine) {
	srv := &http.Server{
		Addr:    ":" + cfg.ServerPort,
		Handler: router,
	}

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			log.Printf("Starting HTTP server on port %s", cfg.ServerPort)
			go func() {
				if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
					log.Printf("Server failed: %v", err)
				}
			}()
			return nil
		},
		OnStop: func(ctx context.Context) error {
			log.Println("Stopping server...")
			return srv.Shutdown(ctx)
		},
	})
}
