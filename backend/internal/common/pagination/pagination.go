package pagination

import (
	"net/http"
	"strconv"
)

type Meta struct {
	Page       int `json:"page"`
	PageSize   int `json:"pageSize"`
	Total      int `json:"total"`
	TotalPages int `json:"totalPages"`
}

type PaginatedResponse[T any] struct {
	Data    []T  `json:"data"`
	Meta    Meta `json:"meta"`
	Filters any  `json:"filters,omitempty"`
}

type Params struct {
	Page     int
	PageSize int
	Offset   int
}

func FromRequest(r *http.Request) Params {
	query := r.URL.Query()

	page := 1
	if pStr := query.Get("page"); pStr != "" {
		if p, err := strconv.Atoi(pStr); err == nil && p > 0 {
			page = p
		}
	}

	pageSize := 12
	if psStr := query.Get("pageSize"); psStr != "" {
		if ps, err := strconv.Atoi(psStr); err == nil && ps > 0 {
			if ps > 50 {
				ps = 50
			}
			pageSize = ps
		}
	}

	offset := (page - 1) * pageSize
	return Params{
		Page:     page,
		PageSize: pageSize,
		Offset:   offset,
	}
}

func BuildMeta(total, page, pageSize int) Meta {
	totalPages := 0
	if pageSize > 0 && total > 0 {
		totalPages = (total + pageSize - 1) / pageSize
	}
	return Meta{
		Page:       page,
		PageSize:   pageSize,
		Total:      total,
		TotalPages: totalPages,
	}
}
