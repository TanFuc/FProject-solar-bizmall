package media

import (
	"bmsolar-backend/internal/config"
	"bytes"
	"image"
	"image/color"
	"image/png"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

type testFile struct{ *bytes.Reader }

func (testFile) Close() error { return nil }
func imageUpload(t *testing.T) ([]byte, *multipart.FileHeader) {
	t.Helper()
	img := image.NewRGBA(image.Rect(0, 0, 100, 60))
	for y := 0; y < 60; y++ {
		for x := 0; x < 100; x++ {
			img.Set(x, y, color.RGBA{R: 200, G: 120, B: 20, A: 255})
		}
	}
	var b bytes.Buffer
	if err := png.Encode(&b, img); err != nil {
		t.Fatal(err)
	}
	return b.Bytes(), &multipart.FileHeader{Filename: "test.png", Size: int64(b.Len())}
}
func TestUploadCreatesRealJPEGVariants(t *testing.T) {
	cfg := &config.Config{LocalStoragePath: t.TempDir(), StorageProvider: "local", ImageMaxWidth: 80, ImageMaxHeight: 80, ImageThumbWidth: 20, ImageMediumWidth: 40, ImageLargeWidth: 60, ImageQuality: 82}
	data, header := imageUpload(t)
	result, err := NewService(cfg).SaveUploadedFile(testFile{bytes.NewReader(data)}, header, nil)
	if err != nil {
		t.Fatal(err)
	}
	if result.Asset.MimeType != "image/jpeg" || *result.Asset.Width != 80 || *result.Asset.Height != 48 {
		t.Fatalf("wrong processed asset: %+v", result.Asset)
	}
	if len(result.Variants) != 3 {
		t.Fatalf("expected 3 actual variants")
	}
	for _, v := range result.Variants {
		f, err := os.Open(filepath.Join(cfg.LocalStoragePath, v.StorageKey))
		if err != nil {
			t.Fatal(err)
		}
		actual, _, err := image.DecodeConfig(f)
		closeErr := f.Close()
		if err != nil || closeErr != nil {
			t.Fatalf("variant decode: %v / %v", err, closeErr)
		}
		if actual.Width != v.Width || actual.Height != v.Height {
			t.Fatalf("metadata differs from actual image bytes: %+v vs %+v", v, actual)
		}
	}
}
func TestR2MisconfigurationCannotReportReady(t *testing.T) {
	data, header := imageUpload(t)
	result, err := NewService(&config.Config{LocalStoragePath: t.TempDir(), StorageProvider: "r2", R2Enabled: true}).SaveUploadedFile(testFile{bytes.NewReader(data)}, header, nil)
	if err == nil || result != nil || !strings.Contains(err.Error(), "R2") {
		t.Fatalf("R2 upload failure was hidden: %v", err)
	}
}
func TestRejectOversizedUpload(t *testing.T) {
	_, err := NewService(&config.Config{LocalStoragePath: t.TempDir(), MaxUploadMB: 1}).SaveUploadedFile(testFile{bytes.NewReader(nil)}, &multipart.FileHeader{Filename: "large.png", Size: 2 << 20}, nil)
	if err == nil {
		t.Fatal("oversized upload accepted")
	}
}
func TestTransparentPNGRetainsOriginalAlpha(t *testing.T) {
	cfg := &config.Config{LocalStoragePath: t.TempDir(), StorageProvider: "local", ImageQuality: 95}
	var encoded bytes.Buffer
	if err := png.Encode(&encoded, image.NewRGBA(image.Rect(0, 0, 12, 12))); err != nil {
		t.Fatal(err)
	}
	result, err := NewService(cfg).SaveUploadedFile(testFile{bytes.NewReader(encoded.Bytes())}, &multipart.FileHeader{Filename: "transparent.png", Size: int64(encoded.Len())}, nil)
	if err != nil {
		t.Fatal(err)
	}
	file, err := os.Open(filepath.Join(cfg.LocalStoragePath, result.Asset.StorageKey))
	if err != nil {
		t.Fatal(err)
	}
	defer file.Close()
	actual, _, err := image.Decode(file)
	if err != nil {
		t.Fatal(err)
	}
	_, _, _, alpha := actual.At(6, 6).RGBA()
	if alpha != 0 || result.Asset.MimeType != "image/png" {
		t.Fatal("transparent input lost its original alpha channel")
	}
}
