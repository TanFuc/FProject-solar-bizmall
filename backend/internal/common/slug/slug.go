package slug

import (
	"fmt"
	"regexp"
	"strings"
	"unicode"
)

var (
	nonAlphanumericRegex = regexp.MustCompile(`[^a-z0-9]+`)
	multipleHyphensRegex = regexp.MustCompile(`-+`)
)

// NormalizeVietnamese converts Vietnamese accented characters into plain ASCII lowercase
func NormalizeVietnamese(s string) string {
	var b strings.Builder
	b.Grow(len(s))

	for _, r := range strings.ToLower(s) {
		switch r {
		case 'à', 'á', 'ạ', 'ả', 'ã', 'â', 'ầ', 'ấ', 'ậ', 'ẩ', 'ẫ', 'ă', 'ằ', 'ắ', 'ặ', 'ẳ', 'ẵ':
			b.WriteRune('a')
		case 'è', 'é', 'ẹ', 'ẻ', 'ẽ', 'ê', 'ề', 'ế', 'ệ', 'ể', 'ễ':
			b.WriteRune('e')
		case 'ì', 'í', 'ị', 'ỉ', 'ĩ':
			b.WriteRune('i')
		case 'ò', 'ó', 'ọ', 'ỏ', 'õ', 'ô', 'ồ', 'ố', 'ộ', 'ổ', 'ỗ', 'ơ', 'ờ', 'ớ', 'ợ', 'ở', 'ỡ':
			b.WriteRune('o')
		case 'ù', 'ú', 'ụ', 'ủ', 'ũ', 'ư', 'ừ', 'ứ', 'ự', 'ử', 'ữ':
			b.WriteRune('u')
		case 'ỳ', 'ý', 'ỵ', 'ỷ', 'ỹ':
			b.WriteRune('y')
		case 'đ':
			b.WriteRune('d')
		default:
			if unicode.IsLetter(r) || unicode.IsDigit(r) || r == '-' || r == ' ' {
				b.WriteRune(r)
			} else {
				b.WriteRune(' ')
			}
		}
	}
	return b.String()
}

// Make generates a clean URL slug from input text with optional collision counter
func Make(input string) string {
	ascii := NormalizeVietnamese(input)
	hyphenated := nonAlphanumericRegex.ReplaceAllString(ascii, "-")
	collapsed := multipleHyphensRegex.ReplaceAllString(hyphenated, "-")
	result := strings.Trim(collapsed, "-")

	if len(result) > 120 {
		result = result[:120]
		result = strings.TrimRight(result, "-")
	}

	if result == "" {
		return "untitled"
	}
	return result
}

// WithSuffix appends a collision index or hash to slug
func WithSuffix(slug string, suffix int) string {
	if suffix <= 1 {
		return slug
	}
	return fmt.Sprintf("%s-%d", slug, suffix)
}
