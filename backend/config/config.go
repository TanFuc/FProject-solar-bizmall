package config

import (
	"bmsolar-backend/internal/config"
)

type Config = config.Config

func LoadConfig() (*Config, error) {
	return config.Load(), nil
}
