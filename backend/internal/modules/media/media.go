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
	"image/jpeg"
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
		return nil, fmt.Errorf("file exceeds %dMB upload limit", maxMB)
	}
	data, err := io.ReadAll(io.LimitReader(file, maxBytes+1))
	if err != nil {
		return nil, fmt.Errorf("read upload: %w", err)
	}
	if int64(len(data)) > maxBytes {
		return nil, fmt.Errorf("file exceeds %dMB upload limit", maxMB)
	}
	assetID := id.New()
	ext := strings.ToLower(filepath.Ext(header.Filename))
	mimeType := http.DetectContentType(data)
	var source image.Image
	var width, height *int
	if strings.HasPrefix(mimeType, "image/") {
		source, _, err = image.Decode(bytes.NewReader(data))
		if err != nil {
			return nil, fmt.Errorf("decode uploaded image: %w", err)
		}
		maxW, maxH := s.cfg.ImageMaxWidth, s.cfg.ImageMaxHeight
		if maxW <= 0 {
			maxW = 2400
		}
		if maxH <= 0 {
			maxH = 2400
		}
		source = fitImage(source, maxW, maxH)
		quality := s.cfg.ImageQuality
		if quality < 1 || quality > 100 {
			quality = 82
		}
		var encoded bytes.Buffer
		if err = jpeg.Encode(&encoded, source, &jpeg.Options{Quality: quality}); err != nil {
			return nil, fmt.Errorf("encode image: %w", err)
		}
		data = encoded.Bytes()
		ext = ".jpg"
		mimeType = "image/jpeg"
		w, h := source.Bounds().Dx(), source.Bounds().Dy()
		width, height = &w, &h
	} else if ext == ".svg" {
		mimeType = "image/svg+xml"
	} else if ext == "" {
		ext = ".bin"
	}
	write := func(key string, body []byte) error {
		if err := os.WriteFile(filepath.Join(s.storagePath, key), body, 0644); err != nil {
			return fmt.Errorf("save media: %w", err)
		}
		if s.cfg.R2Enabled || s.cfg.StorageProvider == "r2" {
			if err := s.uploadToR2(key, body, mimeType); err != nil {
				return fmt.Errorf("upload media to R2: %w", err)
			}
		}
		return nil
	}
	key := assetID + ext
	if err = write(key, data); err != nil {
		return nil, err
	}
	variants := make([]models.MediaVariant, 0)
	urls := make([]VariantItem, 0)
	if source != nil {
		definitions := []struct {
			key   string
			width int
		}{{"thumb", s.cfg.ImageThumbWidth}, {"medium", s.cfg.ImageMediumWidth}, {"large", s.cfg.ImageLargeWidth}}
		for _, definition := range definitions {
			if definition.width <= 0 {
				continue
			}
			img := fitImage(source, definition.width, source.Bounds().Dy())
			var encoded bytes.Buffer
			quality := s.cfg.ImageQuality
			if quality < 1 || quality > 100 {
				quality = 82
			}
			if err = jpeg.Encode(&encoded, img, &jpeg.Options{Quality: quality}); err != nil {
				return nil, fmt.Errorf("encode variant: %w", err)
			}
			variantKey := assetID + "_" + definition.key + ext
			if err = write(variantKey, encoded.Bytes()); err != nil {
				return nil, err
			}
			w, h, size := img.Bounds().Dx(), img.Bounds().Dy(), encoded.Len()
			variants = append(variants, models.MediaVariant{ID: id.New(), AssetID: assetID, VariantKey: definition.key, StorageKey: variantKey, Width: w, Height: h, SizeBytes: size})
			urls = append(urls, VariantItem{VariantKey: definition.key, StorageKey: variantKey, URL: s.cfg.ResolveMediaURL(variantKey), Width: w, Height: h, SizeBytes: size})
		}
	}
	alt := strings.TrimSuffix(header.Filename, filepath.Ext(header.Filename))
	asset := models.MediaAsset{ID: assetID, StorageKey: key, OriginalName: header.Filename, MimeType: mimeType, Bytes: len(data), Width: width, Height: height, AltText: &alt, Status: "ready", UploaderID: uploaderID}
	return &UploadResult{Asset: asset, Variants: variants, AssetURL: s.cfg.ResolveMediaURL(key), VariantURLs: urls}, nil
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
