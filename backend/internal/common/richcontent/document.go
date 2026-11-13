package richcontent

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"strings"
)

const maxDocumentBytes = 768 * 1024
const maxNodes = 3500

type attrs struct {
	Font         string  `json:"font,omitempty"`
	Size         int     `json:"size,omitempty"`
	Color        string  `json:"color,omitempty"`
	TextAlign    string  `json:"textAlign,omitempty"`
	Level        int     `json:"level,omitempty"`
	Start        int     `json:"start,omitempty"`
	Src          string  `json:"src,omitempty"`
	Alt          string  `json:"alt,omitempty"`
	Title        string  `json:"title,omitempty"`
	Caption      string  `json:"caption,omitempty"`
	MediaID      string  `json:"mediaId,omitempty"`
	Placement    string  `json:"placement,omitempty"`
	WidthPercent float64 `json:"widthPercent,omitempty"`
	Href         string  `json:"href,omitempty"`
}

type mark struct {
	Type  string `json:"type"`
	Attrs *attrs `json:"attrs,omitempty"`
}

type node struct {
	Type    string `json:"type"`
	Attrs   *attrs `json:"attrs,omitempty"`
	Content []node `json:"content,omitempty"`
	Marks   []mark `json:"marks,omitempty"`
	Text    string `json:"text,omitempty"`
}

func allowedURL(value string, link bool) bool {
	if strings.ContainsAny(value, " \\\r\n\t") {
		return false
	}
	if strings.HasPrefix(value, "/") {
		return !strings.HasPrefix(value, "//") && !strings.HasPrefix(value, "/\\")
	}
	if link && strings.HasPrefix(value, "#") {
		return true
	}
	u, err := url.Parse(value)
	if err != nil {
		return false
	}
	switch u.Scheme {
	case "http", "https":
		return u.Host != ""
	case "mailto", "tel":
		return link && u.Opaque != ""
	default:
		return false
	}
}

func (n *node) walk(depth int, remaining *int, resolve func(string) (string, error)) error {
	*remaining--
	if depth > 32 || *remaining < 0 {
		return errors.New("document nesting or block count exceeds the limit")
	}
	switch n.Type {
	case "doc", "paragraph", "heading", "bulletList", "orderedList", "listItem", "blockquote", "hardBreak", "horizontalRule", "codeBlock", "text":
	case "image":
		if n.Attrs == nil || !allowedURL(n.Attrs.Src, false) {
			return errors.New("document contains an invalid image URL")
		}
		if n.Attrs.MediaID != "" && resolve != nil {
			publicURL, err := resolve(n.Attrs.MediaID)
			if err != nil {
				return fmt.Errorf("resolve document image: %w", err)
			}
			if publicURL != "" {
				n.Attrs.Src = publicURL
			}
		}
	default:
		return fmt.Errorf("unsupported document node %q", n.Type)
	}
	for _, m := range n.Marks {
		switch m.Type {
		case "bold", "italic", "underline", "strike", "code", "textFormat":
		case "link":
			if m.Attrs == nil || !allowedURL(m.Attrs.Href, true) {
				return errors.New("document contains an invalid link")
			}
		default:
			return fmt.Errorf("unsupported document mark %q", m.Type)
		}
	}
	for i := range n.Content {
		if err := n.Content[i].walk(depth+1, remaining, resolve); err != nil {
			return err
		}
	}
	return nil
}

// Process handles the document format and preserves older plain-text and JSON records.
// Wrapper properties store legacy facts alongside the editable document.
func Process(value string, resolve func(string) (string, error)) (string, error) {
	if len(value) > maxDocumentBytes {
		return "", errors.New("document exceeds 768 KiB")
	}
	if !strings.HasPrefix(strings.TrimSpace(value), "{") {
		return value, nil
	}
	var shape struct {
		Type     string          `json:"type"`
		Document json.RawMessage `json:"document"`
	}
	if err := json.Unmarshal([]byte(value), &shape); err != nil {
		return value, nil
	}
	raw := []byte(value)
	wrapped := len(shape.Document) != 0 && !bytes.Equal(shape.Document, []byte("null"))
	if wrapped {
		raw = shape.Document
	} else if shape.Type != "doc" {
		return value, nil
	}
	var doc node
	if err := json.Unmarshal(raw, &doc); err != nil {
		return "", fmt.Errorf("decode document: %w", err)
	}
	if doc.Type != "doc" {
		return "", errors.New("document root must be doc")
	}
	remaining := maxNodes
	if err := doc.walk(0, &remaining, resolve); err != nil {
		return "", err
	}
	if resolve == nil {
		return value, nil
	}
	output, err := json.Marshal(doc)
	if err != nil {
		return "", fmt.Errorf("encode document: %w", err)
	}
	if wrapped {
		var wrapper map[string]json.RawMessage
		if err := json.Unmarshal([]byte(value), &wrapper); err != nil {
			return "", fmt.Errorf("decode document wrapper: %w", err)
		}
		wrapper["document"] = output
		output, err = json.Marshal(wrapper)
		if err != nil {
			return "", fmt.Errorf("encode document wrapper: %w", err)
		}
	}
	return string(output), nil
}

func Validate(values ...string) error {
	for _, value := range values {
		if _, err := Process(value, nil); err != nil {
			return err
		}
	}
	return nil
}

func PlainText(value string) (string, bool) {
	var doc node
	if err := json.Unmarshal([]byte(value), &doc); err != nil || doc.Type != "doc" {
		return value, false
	}
	var parts []string
	var walk func(node)
	walk = func(current node) {
		if current.Type == "text" && current.Text != "" {
			parts = append(parts, current.Text)
		}
		if current.Type == "image" && current.Attrs != nil && current.Attrs.Caption != "" {
			parts = append(parts, current.Attrs.Caption)
		}
		for _, child := range current.Content {
			walk(child)
		}
	}
	walk(doc)
	return strings.Join(parts, " "), true
}
