package cms

import (
	"bmsolar-backend/internal/modules/media"
	"encoding/json"
	"fmt"
)

func (h *Handler) hydrateMedia(blocks []Block) error {
	for i := range blocks {
		if blocks[i].Type == "projectGallery" {
			var gallery struct {
				Items []struct {
					Key      string `json:"key"`
					MediaID  string `json:"mediaId"`
					MediaURL string `json:"mediaUrl"`
					Alt      string `json:"alt"`
				} `json:"items"`
			}
			if err := json.Unmarshal(blocks[i].Data, &gallery); err != nil {
				return err
			}
			if len(gallery.Items) > 0 {
				for j := range gallery.Items {
					url, err := media.ResolvePublicURL(h.db, h.cfg, gallery.Items[j].MediaID)
					if err != nil {
						return err
					}
					gallery.Items[j].MediaURL = url
				}
				encoded, err := json.Marshal(gallery)
				if err != nil {
					return err
				}
				blocks[i].Data = encoded
			}
			continue
		}
		if blocks[i].Type != "heroCarousel" {
			continue
		}
		var data HeroCarouselData
		if err := json.Unmarshal(blocks[i].Data, &data); err != nil {
			return fmt.Errorf("decode hero: %w", err)
		}
		for j := range data.Slides {
			slide := &data.Slides[j]
			if slide.DesktopMediaID != "" {
				url, err := media.ResolvePublicURL(h.db, h.cfg, slide.DesktopMediaID)
				if err != nil {
					return err
				}
				if url != "" {
					slide.DesktopMediaURL = url
				}
			}
			if slide.MobileMediaID != "" {
				url, err := media.ResolvePublicURL(h.db, h.cfg, slide.MobileMediaID)
				if err != nil {
					return err
				}
				if url != "" {
					slide.MobileMediaURL = url
				}
			}
		}
		encoded, err := json.Marshal(data)
		if err != nil {
			return err
		}
		blocks[i].Data = encoded
	}
	return nil
}
