package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	AppEnv                string `mapstructure:"APP_ENV"`
	ServerPort            string `mapstructure:"SERVER_PORT"`
	DBUri                 string `mapstructure:"DB_URI"`
	DBName                string `mapstructure:"DB_NAME"`
	JWTSecret             string `mapstructure:"JWT_SECRET"`
	FrontendURL           string `mapstructure:"FRONTEND_URL"`
	StripeSecretKey       string `mapstructure:"STRIPE_SECRET_KEY"`
	StripeConnectClientID string `mapstructure:"STRIPE_CONNECT_CLIENT_ID"`
}

func LoadConfig() (*Config, error) {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()

	err := viper.ReadInConfig()
	if err != nil {
		// It's okay if .env doesn't exist, we might be using real env vars in prod
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, err
		}
	}

	config := &Config{}
	err = viper.Unmarshal(config)
	if err != nil {
		return nil, err
	}

	// Set defaults
	if config.ServerPort == "" {
		config.ServerPort = "8080"
	}
	if config.AppEnv == "" {
		config.AppEnv = "development"
	}

	return config, nil
}
