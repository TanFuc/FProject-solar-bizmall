package media

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"bmsolar-backend/internal/common/id"
	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/database/models"
)

type Service struct {
	cfg         *config.Config
	storagePath string
}

func NewService(cfg *config.Config) *Service {
	storagePath := cfg.LocalStoragePath
	if storagePath == "" {
		storagePath = cfg.StorageDir
	}
	if storagePath == "" {
		storagePath = "./storage"
	}
	_ = os.MkdirAll(storagePath, 0755)

	return &Service{
		cfg:         cfg,
		storagePath: storagePath,
	}
}

type VariantItem struct {
	VariantKey string `json:"variantKey"`
	StorageKey string `json:"storageKey"`
	URL        string `json:"url"`
	Width      int    `json:"width"`
	Height     int    `json:"height"`
	SizeBytes  int    `json:"sizeBytes"`
}

type UploadResult struct {
	Asset       models.MediaAsset
	Variants    []models.MediaVariant
	AssetURL    string
	VariantURLs []VariantItem
}

// SaveUploadedFile processes uploaded file, saves to storage, and generates responsive variant metadata
func (s *Service) SaveUploadedFile(file multipart.File, header *multipart.FileHeader, uploaderID *string) (*UploadResult, error) {
	maxMB := s.cfg.MaxUploadMB
	if maxMB <= 0 {
		maxMB = 25
	}
	maxBytes := int64(maxMB) << 20

	if header.Size > maxBytes {
		return nil, fmt.Errorf("file size %d bytes exceeds maximum allowed %dMB", header.Size, maxMB)
	}

	assetID := id.New()
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext == "" {
		ext = ".bin"
	}

	storageKey := fmt.Sprintf("%s%s", assetID, ext)
	targetPath := filepath.Join(s.storagePath, storageKey)

	// Read file content
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("failed to read upload file: %w", err)
	}

	// Always save locally for serving / fallback
	if err := os.WriteFile(targetPath, fileBytes, 0644); err != nil {
		return nil, fmt.Errorf("failed to save file locally: %w", err)
	}

	// If R2 is enabled, upload to Cloudflare R2
	if (s.cfg.R2Enabled || s.cfg.StorageProvider == "r2") && s.cfg.R2AccountID != "" && s.cfg.R2Bucket != "" {
		_ = s.uploadToR2(storageKey, fileBytes, header.Header.Get("Content-Type"))
	}

	mimeType := header.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}

	var width, height *int
	variants := make([]models.MediaVariant, 0)
	variantItems := make([]VariantItem, 0)

	// Inspect dimensions if image
	if strings.HasPrefix(mimeType, "image/") && ext != ".svg" {
		cfg, _, imgErr := image.DecodeConfig(bytes.NewReader(fileBytes))
		if imgErr == nil {
			w := cfg.Width
			h := cfg.Height
			width = &w
			height = &h

			thumbW := s.cfg.ImageThumbWidth
			if thumbW <= 0 {
				thumbW = 480
			}
			mediumW := s.cfg.ImageMediumWidth
			if mediumW <= 0 {
				mediumW = 1200
			}
			largeW := s.cfg.ImageLargeWidth
			if largeW <= 0 {
				largeW = 1800
			}

			variantDefs := []struct {
				Key    string
				Width  int
				Height int
			}{
				{Key: "thumb", Width: thumbW, Height: int(float64(thumbW) * float64(h) / float64(w))},
				{Key: "medium", Width: mediumW, Height: int(float64(mediumW) * float64(h) / float64(w))},
				{Key: "large", Width: largeW, Height: int(float64(largeW) * float64(h) / float64(w))},
				{Key: "desktop_16_9", Width: 1920, Height: 1080},
				{Key: "mobile_4_5", Width: 800, Height: 1000},
			}

			for _, vd := range variantDefs {
				vKey := fmt.Sprintf("%s_%s%s", assetID, vd.Key, ext)
				vURL := s.cfg.ResolveMediaURL(vKey)

				mv := models.MediaVariant{
					ID:         id.New(),
					AssetID:    assetID,
					VariantKey: vd.Key,
					StorageKey: vKey,
					Width:      vd.Width,
					Height:     vd.Height,
					SizeBytes:  len(fileBytes),
				}
				variants = append(variants, mv)
				variantItems = append(variantItems, VariantItem{
					VariantKey: vd.Key,
					StorageKey: vKey,
					URL:        vURL,
					Width:      vd.Width,
					Height:     vd.Height,
					SizeBytes:  len(fileBytes),
				})

				// If R2 enabled, push variant reference or sync
				if (s.cfg.R2Enabled || s.cfg.StorageProvider == "r2") && s.cfg.R2AccountID != "" {
					_ = s.uploadToR2(vKey, fileBytes, mimeType)
				}
			}
		}
	}

	altText := strings.TrimSuffix(header.Filename, ext)
	asset := models.MediaAsset{
		ID:           assetID,
		StorageKey:   storageKey,
		OriginalName: header.Filename,
		MimeType:     mimeType,
		Bytes:        len(fileBytes),
		Width:        width,
		Height:       height,
		AltText:      &altText,
		Status:       "ready",
		UploaderID:   uploaderID,
	}

	assetURL := s.cfg.ResolveMediaURL(storageKey)

	return &UploadResult{
		Asset:       asset,
		Variants:    variants,
		AssetURL:    assetURL,
		VariantURLs: variantItems,
	}, nil
}

// uploadToR2 uploads file bytes to Cloudflare R2 S3-compatible API
func (s *Service) uploadToR2(storageKey string, data []byte, contentType string) error {
	accountID := s.cfg.R2AccountID
	bucket := s.cfg.R2Bucket
	accessKey := s.cfg.R2AccessKeyID
	secretKey := s.cfg.R2SecretAccessKey

	if accountID == "" || bucket == "" || accessKey == "" || secretKey == "" {
		return fmt.Errorf("R2 credentials not fully configured")
	}

	// Cloudflare R2 S3 API Endpoint: https://<account_id>.r2.cloudflarestorage.com/<bucket>/<key>
	endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com/%s/%s", accountID, bucket, storageKey)

	req, err := http.NewRequestWithContext(context.Background(), "PUT", endpoint, bytes.NewReader(data))
	if err != nil {
		return err
	}

	if contentType == "" {
		contentType = "application/octet-stream"
	}
	req.Header.Set("Content-Type", contentType)

	// AWS SigV4 Auth Headers for Cloudflare R2
	t := time.Now().UTC()
	dateStr := t.Format("20060102")
	amzDate := t.Format("20060102T150405Z")

	payloadHash := sha256.Sum256(data)
	payloadHashHex := hex.EncodeToString(payloadHash[:])

	req.Header.Set("x-amz-date", amzDate)
	req.Header.Set("x-amz-content-sha256", payloadHashHex)

	region := s.cfg.R2Region
	if region == "" {
		region = "auto"
	}
	credentialScope := fmt.Sprintf("%s/%s/s3/aws4_request", dateStr, region)

	canonicalHeaders := fmt.Sprintf("host:%s.r2.cloudflarestorage.com\nx-amz-content-sha256:%s\nx-amz-date:%s\n",
		accountID, payloadHashHex, amzDate)
	signedHeaders := "host;x-amz-content-sha256;x-amz-date"

	canonicalRequest := fmt.Sprintf("PUT\n/%s/%s\n\n%s\n%s\n%s",
		bucket, storageKey, canonicalHeaders, signedHeaders, payloadHashHex)

	canonicalRequestHash := sha256.Sum256([]byte(canonicalRequest))

	stringToSign := fmt.Sprintf("AWS4-HMAC-SHA256\n%s\n%s\n%s",
		amzDate, credentialScope, hex.EncodeToString(canonicalRequestHash[:]))

	// Derive signing key
	kDate := hmacSHA256([]byte("AWS4"+secretKey), []byte(dateStr))
	kRegion := hmacSHA256(kDate, []byte(region))
	kService := hmacSHA256(kRegion, []byte("s3"))
	kSigning := hmacSHA256(kService, []byte("aws4_request"))

	signature := hex.EncodeToString(hmacSHA256(kSigning, []byte(stringToSign)))

	authHeader := fmt.Sprintf("AWS4-HMAC-SHA256 Credential=%s/%s, SignedHeaders=%s, Signature=%s",
		accessKey, credentialScope, signedHeaders, signature)
	req.Header.Set("Authorization", authHeader)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("R2 upload returned status: %d", resp.StatusCode)
	}
	return nil
}

func hmacSHA256(key, data []byte) []byte {
	h := hmac.New(sha256.New, key)
	h.Write(data)
	return h.Sum(nil)
}
