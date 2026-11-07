package id

import (
	"crypto/rand"
	"time"

	"github.com/oklog/ulid/v2"
)

// New generates a canonical 26-character ULID string
func New() string {
	entropy := ulid.Monotonic(rand.Reader, 0)
	return ulid.MustNew(ulid.Timestamp(time.Now()), entropy).String()
}
