package test

import (
	"bytes"
	"image"
	"image/color"
	"image/png"
	"mime/multipart"
	"net/textproto"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"bmsolar-backend/internal/config"
	"bmsolar-backend/internal/modules/media"
)

type memoryFile struct {
	*bytes.Reader
}

func (m memoryFile) Close() error {
	return nil
}

func TestAlphaPersistence_TransparentPNGPreserved(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "bmsolar-media-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	cfg := &config.Config{
		LocalStoragePath:  tempDir,
		ImageMaxWidth:     800,
		ImageMaxHeight:    800,
		ImageThumbWidth:   100,
		ImageMediumWidth:  300,
		ImageLargeWidth:   600,
		ImageQuality:      85,
		MaxUploadMB:       10,
	}

	service := media.NewService(cfg)

	// Create a 200x200 image with transparent background and non-white logo glyph
	img := image.NewRGBA(image.Rect(0, 0, 200, 200))
	for y := 0; y < 200; y++ {
		for x := 0; x < 200; x++ {
			if x >= 50 && x < 150 && y >= 50 && y < 150 {
				// Solid brand blue
				img.Set(x, y, color.RGBA{R: 14, G: 116, B: 219, A: 255})
			} else {
				// Fully transparent background
				img.Set(x, y, color.RGBA{R: 0, G: 0, B: 0, A: 0})
			}
		}
	}

	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		t.Fatalf("failed to encode test png: %v", err)
	}

	rawBytes := buf.Bytes()
	fileHeader := &multipart.FileHeader{
		Filename: "bm-solar-logo.png",
		Size:     int64(len(rawBytes)),
		Header:   make(textproto.MIMEHeader),
	}

	file := memoryFile{bytes.NewReader(rawBytes)}
	result, err := service.SaveUploadedFile(file, fileHeader, nil)
	if err != nil {
		t.Fatalf("SaveUploadedFile failed: %v", err)
	}

	// 1. Verify master asset metadata preserves PNG format
	if result.Asset.MimeType != "image/png" {
		t.Errorf("expected mimeType image/png, got %s", result.Asset.MimeType)
	}
	if !strings.HasSuffix(result.Asset.StorageKey, ".png") {
		t.Errorf("expected storageKey to end with .png, got %s", result.Asset.StorageKey)
	}

	// 2. Read master asset from storage and assert alpha is preserved (NOT composited to white)
	masterPath := filepath.Join(tempDir, result.Asset.StorageKey)
	masterData, err := os.ReadFile(masterPath)
	if err != nil {
		t.Fatalf("failed to read saved master image: %v", err)
	}

	decodedMaster, err := png.Decode(bytes.NewReader(masterData))
	if err != nil {
		t.Fatalf("saved image cannot be decoded as PNG: %v", err)
	}

	// Verify corner pixel (0,0) is still transparent (Alpha == 0)
	_, _, _, aCorner := decodedMaster.At(0, 0).RGBA()
	if aCorner != 0 {
		t.Fatalf("expected corner pixel alpha to be 0 (transparent), got %d (white compositing detected!)", aCorner)
	}

	// Verify center pixel (100,100) is solid blue
	rCenter, gCenter, bCenter, aCenter := decodedMaster.At(100, 100).RGBA()
	if aCenter != 0xffff || rCenter == 0xffff && gCenter == 0xffff && bCenter == 0xffff {
		t.Fatalf("expected center pixel to be solid color, got RGBA(%d,%d,%d,%d)", rCenter, gCenter, bCenter, aCenter)
	}

	// 3. Verify responsive variants also maintain PNG format and alpha
	if len(result.Variants) == 0 {
		t.Fatalf("expected responsive variants to be generated")
	}

	for _, v := range result.Variants {
		if !strings.HasSuffix(v.StorageKey, ".png") {
			t.Errorf("expected variant %s storageKey to end in .png, got %s", v.VariantKey, v.StorageKey)
		}

		variantPath := filepath.Join(tempDir, v.StorageKey)
		variantData, err := os.ReadFile(variantPath)
		if err != nil {
			t.Fatalf("failed to read variant file %s: %v", v.StorageKey, err)
		}

		decodedVariant, err := png.Decode(bytes.NewReader(variantData))
		if err != nil {
			t.Fatalf("variant %s cannot be decoded as PNG: %v", v.VariantKey, err)
		}

		// Variant corner must also remain transparent
		_, _, _, aVarCorner := decodedVariant.At(0, 0).RGBA()
		if aVarCorner != 0 {
			t.Fatalf("variant %s corner alpha is %d, expected 0", v.VariantKey, aVarCorner)
		}
	}
}
