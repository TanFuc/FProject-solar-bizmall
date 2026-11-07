package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                 string
	Env                  string
	DatabaseURL          string
	DBDriver             string
	AppBaseURL           string
	WebPublicURL         string
	CorsAllowedOrigins   []string
	JWTAccessSecret      string
	JWTRefreshSecret     string
	JWTAccessTTLSeconds  int
	JWTRefreshTTLSeconds int

	// Storage & CDN Configuration
	StorageProvider      string // local, r2, s3
	LocalStoragePath     string // ./storage or ./uploads
	StorageDir           string // legacy alias for LocalStoragePath
	StorageBucket        string
	StorageEndpoint      string
	ImageBaseURL         string // Public URL prefix, e.g. https://images.example.com/storage
	R2Enabled            bool
	R2AccountID          string
	R2AccessKeyID        string
	R2SecretAccessKey    string
	R2Bucket             string
	R2PublicBaseURL      string
	R2Region             string

	// Image Processing & Upload Limits
	MaxUploadMB          int    // e.g. 25
	ImageMaxWidth        int    // e.g. 2400
	ImageMaxHeight       int    // e.g. 2400
	ImageQuality         int    // e.g. 82
	ImageThumbWidth      int    // e.g. 480
	ImageMediumWidth     int    // e.g. 1200
	ImageLargeWidth      int    // e.g. 1800
	ImageOutputFormat    string // jpeg, webp

	// Cache, Rate Limit & Concurrency
	CacheTTLSeconds        int // e.g. 300
	RateLimitRPS           int // e.g. 10
	MaxConcurrentRequests  int // e.g. 0 (unlimited)
	RuntimeGOMAXPROCS      int // e.g. 0 (auto-detect)
	AppInstanceLockPath    string

	// Redis
	RedisAddr            string // localhost:6379
	RedisURL             string
	RedisPassword        string
	RedisDB              int

	// SEO & Logging
	LogLevel             string
	SeoAIProvider        string
	SeoAIKey             string
}

func Load() *Config {
	_ = godotenv.Load() // load from .env if present

	port := getEnv("PORT", "3001")
	env := getEnv("APP_ENV", getEnv("NODE_ENV", "development"))
	databaseURL := getEnv("DATABASE_URL", "sqlite://bmsolar.db")
	dbDriver := "sqlite"
	if strings.HasPrefix(databaseURL, "mysql://") || strings.Contains(databaseURL, "@tcp(") {
		dbDriver = "mysql"
	}

	corsOriginsStr := getEnv("CORS_ALLOWED_ORIGINS", "")
	var corsOrigins []string
	if strings.TrimSpace(corsOriginsStr) != "" {
		for _, p := range strings.Split(corsOriginsStr, ",") {
			if trimmed := strings.TrimSpace(p); trimmed != "" {
				corsOrigins = append(corsOrigins, trimmed)
			}
		}
	} else {
		corsOrigins = []string{"http://localhost:3000", "http://localhost:3002"}
	}

	jwtAccessTTL, _ := strconv.Atoi(getEnv("JWT_ACCESS_TTL_SECONDS", "900"))
	jwtRefreshTTL, _ := strconv.Atoi(getEnv("JWT_REFRESH_TTL_SECONDS", "604800"))

	localStoragePath := getEnv("LOCAL_STORAGE_PATH", getEnv("STORAGE_DIR", "./storage"))

	return &Config{
		Port:                 port,
		Env:                  env,
		DatabaseURL:          databaseURL,
		DBDriver:             dbDriver,
		AppBaseURL:           getEnv("APP_BASE_URL", "http://localhost:3001"),
		WebPublicURL:         getEnv("WEB_PUBLIC_URL", "http://localhost:3000"),
		CorsAllowedOrigins:   corsOrigins,
		JWTAccessSecret:      getEnv("JWT_ACCESS_SECRET", "bmsolar_dev_jwt_access_secret_32bytes!"),
		JWTRefreshSecret:     getEnv("JWT_REFRESH_SECRET", "bmsolar_dev_jwt_refresh_secret_32bytes!"),
		JWTAccessTTLSeconds:  jwtAccessTTL,
		JWTRefreshTTLSeconds: jwtRefreshTTL,

		// Storage & Uploads
		StorageProvider:      getEnv("STORAGE_PROVIDER", "local"),
		LocalStoragePath:     localStoragePath,
		StorageDir:           localStoragePath, // keep backward compatible
		StorageBucket:        getEnv("STORAGE_BUCKET", "bmsolar-media"),
		StorageEndpoint:      getEnv("STORAGE_ENDPOINT", "http://localhost:9000"),
		ImageBaseURL:         getEnv("IMAGE_BASE_URL", ""),
		R2Enabled:            getBoolEnv("R2_ENABLED", false),
		R2AccountID:          getEnv("R2_ACCOUNT_ID", ""),
		R2AccessKeyID:        getEnv("R2_ACCESS_KEY_ID", ""),
		R2SecretAccessKey:    getEnv("R2_SECRET_ACCESS_KEY", ""),
		R2Bucket:             getEnv("R2_BUCKET", ""),
		R2PublicBaseURL:      getEnv("R2_PUBLIC_BASE_URL", ""),
		R2Region:             getEnv("R2_REGION", "auto"),

		// Image Specs & Limits
		MaxUploadMB:          getIntEnv("MAX_UPLOAD_MB", 25),
		ImageMaxWidth:        getIntEnv("IMAGE_MAX_WIDTH", 2400),
		ImageMaxHeight:       getIntEnv("IMAGE_MAX_HEIGHT", 2400),
		ImageQuality:         getIntEnv("IMAGE_QUALITY", 82),
		ImageThumbWidth:      getIntEnv("IMAGE_THUMB_WIDTH", 480),
		ImageMediumWidth:     getIntEnv("IMAGE_MEDIUM_WIDTH", 1200),
		ImageLargeWidth:      getIntEnv("IMAGE_LARGE_WIDTH", 1800),
		ImageOutputFormat:    getEnv("IMAGE_OUTPUT_FORMAT", "jpeg"),

		// Cache, Rate Limit & Concurrency
		CacheTTLSeconds:       getIntEnv("CACHE_TTL_SECONDS", 300),
		RateLimitRPS:          getIntEnv("RATE_LIMIT_RPS", 10),
		MaxConcurrentRequests: getIntEnv("MAX_CONCURRENT_REQUESTS", 0),
		RuntimeGOMAXPROCS:     getIntEnv("RUNTIME_GOMAXPROCS", 0),
		AppInstanceLockPath:   getEnv("APP_INSTANCE_LOCK_PATH", ""),

		// Redis
		RedisAddr:            getEnv("REDIS_ADDR", "localhost:6379"),
		RedisURL:             getEnv("REDIS_URL", ""),
		RedisPassword:        getEnv("REDIS_PASSWORD", ""),
		RedisDB:              getIntEnv("REDIS_DB", 0),

		// Misc
		LogLevel:             getEnv("LOG_LEVEL", "info"),
		SeoAIProvider:        getEnv("SEO_AI_PROVIDER", "deterministic"),
		SeoAIKey:             getEnv("SEO_AI_API_KEY", ""),
	}
}

// GetImageBaseURL resolves the canonical public URL prefix for images
func (c *Config) GetImageBaseURL() string {
	if c.ImageBaseURL != "" {
		return strings.TrimRight(c.ImageBaseURL, "/")
	}
	if c.R2PublicBaseURL != "" {
		return strings.TrimRight(c.R2PublicBaseURL, "/")
	}
	return fmt.Sprintf("%s/media", strings.TrimRight(c.AppBaseURL, "/"))
}

// ResolveMediaURL constructs the public URL for an asset or variant storage key
func (c *Config) ResolveMediaURL(storageKey string) string {
	if storageKey == "" {
		return ""
	}
	if strings.HasPrefix(storageKey, "http://") || strings.HasPrefix(storageKey, "https://") {
		return storageKey
	}
	return fmt.Sprintf("%s/%s", c.GetImageBaseURL(), strings.TrimLeft(storageKey, "/"))
}

func getEnv(key, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok && strings.TrimSpace(val) != "" {
		return strings.TrimSpace(val)
	}
	return defaultVal
}

func getIntEnv(key string, defaultVal int) int {
	valStr := os.Getenv(key)
	if valStr == "" {
		return defaultVal
	}
	n, err := strconv.Atoi(strings.TrimSpace(valStr))
	if err != nil {
		return defaultVal
	}
	return n
}

func getBoolEnv(key string, defaultVal bool) bool {
	valStr := os.Getenv(key)
	if valStr == "" {
		return defaultVal
	}
	valStr = strings.ToLower(strings.TrimSpace(valStr))
	return valStr == "true" || valStr == "1" || valStr == "yes"
}
