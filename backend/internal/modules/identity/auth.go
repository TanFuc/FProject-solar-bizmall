package identity

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"net/http"
	"strings"
	"time"

	"bmsolar-backend/internal/common/errors"
	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/argon2"
	"golang.org/x/crypto/bcrypt"
)

type contextKey string

const (
	AuthUserKey contextKey = "auth_user"
)

type AuthUser struct {
	ID          string   `json:"id"`
	Email       string   `json:"email"`
	DisplayName string   `json:"displayName"`
	BranchID    *string  `json:"branchId"`
	Roles       []string `json:"roles"`
	Permissions []string `json:"permissions"`
}

type JWTClaims struct {
	UserID      string   `json:"userId"`
	Email       string   `json:"email"`
	DisplayName string   `json:"displayName"`
	BranchID    *string  `json:"branchId"`
	Roles       []string `json:"roles"`
	Permissions []string `json:"permissions"`
	jwt.RegisteredClaims
}

// HashPassword hashes password using Argon2id
func HashPassword(password string) (string, error) {
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}

	timeCost := uint32(1)
	memory := uint32(64 * 1024)
	threads := uint8(4)
	keyLen := uint32(32)

	hash := argon2.IDKey([]byte(password), salt, timeCost, memory, threads, keyLen)

	b64Salt := base64.RawStdEncoding.EncodeToString(salt)
	b64Hash := base64.RawStdEncoding.EncodeToString(hash)

	return fmt.Sprintf("$argon2id$v=19$m=%d,t=%d,p=%d$%s$%s", memory, timeCost, threads, b64Salt, b64Hash), nil
}

// CheckPassword compares plain password with argon2id or bcrypt hash
func CheckPassword(password, encodedHash string) bool {
	if strings.HasPrefix(encodedHash, "$2a$") || strings.HasPrefix(encodedHash, "$2b$") {
		return bcrypt.CompareHashAndPassword([]byte(encodedHash), []byte(password)) == nil
	}

	parts := strings.Split(encodedHash, "$")
	if len(parts) != 6 || parts[1] != "argon2id" {
		return false
	}

	var memory, timeCost uint32
	var threads uint8
	_, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &timeCost, &threads)
	if err != nil {
		return false
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return false
	}

	decodedHash, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil {
		return false
	}

	comparisonHash := argon2.IDKey([]byte(password), salt, timeCost, memory, threads, uint32(len(decodedHash)))
	return subtle.ConstantTimeCompare(decodedHash, comparisonHash) == 1
}

// GenerateTokens creates access token and refresh token
func GenerateTokens(cfg *config.Config, user *AuthUser) (string, string, error) {
	now := time.Now().UTC()

	accessClaims := &JWTClaims{
		UserID:      user.ID,
		Email:       user.Email,
		DisplayName: user.DisplayName,
		BranchID:    user.BranchID,
		Roles:       user.Roles,
		Permissions: user.Permissions,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID,
			Issuer:    "bmsolar-api",
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(time.Duration(cfg.JWTAccessTTLSeconds) * time.Second)),
		},
	}
	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims).SignedString([]byte(cfg.JWTAccessSecret))
	if err != nil {
		return "", "", err
	}

	refreshClaims := &jwt.RegisteredClaims{
		Subject:   user.ID,
		Issuer:    "bmsolar-api",
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(time.Duration(cfg.JWTRefreshTTLSeconds) * time.Second)),
	}
	refreshToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims).SignedString([]byte(cfg.JWTRefreshSecret))
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

// RequireAuth authenticates request via Bearer token
func RequireAuth(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			tokenStr := ""
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
			} else if cookie, err := r.Cookie("access_token"); err == nil {
				tokenStr = cookie.Value
			}

			if tokenStr == "" {
				errors.WriteJSON(w, r, errors.Unauthorized("Authentication required"))
				return
			}

			claims := &JWTClaims{}
			token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("unexpected signing method")
				}
				return []byte(cfg.JWTAccessSecret), nil
			})

			if err != nil || !token.Valid {
				errors.WriteJSON(w, r, errors.Unauthorized("Invalid or expired session token"))
				return
			}

			authUser := &AuthUser{
				ID:          claims.UserID,
				Email:       claims.Email,
				DisplayName: claims.DisplayName,
				BranchID:    claims.BranchID,
				Roles:       claims.Roles,
				Permissions: claims.Permissions,
			}

			ctx := context.WithValue(r.Context(), AuthUserKey, authUser)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequirePermission checks if authenticated user has permission
func RequirePermission(requiredPermission string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user, ok := r.Context().Value(AuthUserKey).(*AuthUser)
			if !ok || user == nil {
				errors.WriteJSON(w, r, errors.Unauthorized("Authentication required"))
				return
			}

			// Super Admin bypasses individual permission checks
			for _, role := range user.Roles {
				if role == "super_admin" {
					next.ServeHTTP(w, r)
					return
				}
			}

			hasPerm := false
			for _, p := range user.Permissions {
				if p == requiredPermission || p == "*" {
					hasPerm = true
					break
				}
				// prefix matching e.g. catalog.product.*
				if strings.HasSuffix(p, ".*") {
					prefix := strings.TrimSuffix(p, ".*")
					if strings.HasPrefix(requiredPermission, prefix) {
						hasPerm = true
						break
					}
				}
			}

			if !hasPerm {
				errors.WriteJSON(w, r, errors.Forbidden(fmt.Sprintf("Permission denied: %s required", requiredPermission)))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// GetUserFromContext retrieves authenticated user
func GetUserFromContext(ctx context.Context) *AuthUser {
	if u, ok := ctx.Value(AuthUserKey).(*AuthUser); ok {
		return u
	}
	return nil
}

// BuildAuthUser creates AuthUser struct from DB models
func BuildAuthUser(u *models.User) *AuthUser {
	roles := make([]string, 0, len(u.Roles))
	permMap := make(map[string]bool)

	for _, role := range u.Roles {
		roles = append(roles, role.Code)
		for _, perm := range role.Permissions {
			permMap[perm.Code] = true
		}
	}

	permissions := make([]string, 0, len(permMap))
	for p := range permMap {
		permissions = append(permissions, p)
	}

	return &AuthUser{
		ID:          u.ID,
		Email:       u.Email,
		DisplayName: u.DisplayName,
		BranchID:    u.BranchID,
		Roles:       roles,
		Permissions: permissions,
	}
}
