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
			repository.NewMongoAffiliateRepository,
			repository.NewMongoInvoiceRepository,

			// Payment Deps
			sys_payment.NewStripeAdapter,
			services.NewPaymentService,
			services.NewWalletService,
			services.NewAffiliateService,
			services.NewInvoiceService,

			handler.NewPaymentHandler,
			handler.NewWalletHandler,
			handler.NewAffiliateHandler,
			handler.NewInvoiceHandler,

			services.NewTokenService,
			services.NewAuthService,
			services.NewPricingService, // Added
			handler.NewAuthHandler,
			handler.NewPricingHandler, // Added
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

func RegisterRoutes(router *gin.Engine, authHandler *handler.AuthHandler, pricingHandler *handler.PricingHandler, paymentHandler *handler.PaymentHandler, walletHandler *handler.WalletHandler, affiliateHandler *handler.AffiliateHandler, invoiceHandler *handler.InvoiceHandler, authMiddleware *middleware.AuthMiddleware) {
	authHandler.RegisterRoutes(router, authMiddleware.Protect())
	pricingHandler.RegisterRoutes(router, authMiddleware.Protect())
	paymentHandler.RegisterRoutes(router, authMiddleware.Protect())
	walletHandler.RegisterRoutes(router, authMiddleware.Protect())
	affiliateHandler.RegisterRoutes(router, authMiddleware.Protect())
	invoiceHandler.RegisterRoutes(router, authMiddleware.Protect())
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
