package errors

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type ErrorCode string

const (
	ErrValidation      ErrorCode = "VALIDATION_ERROR"
	ErrUnauthorized    ErrorCode = "UNAUTHORIZED"
	ErrForbidden       ErrorCode = "FORBIDDEN"
	ErrNotFound        ErrorCode = "NOT_FOUND"
	ErrConflict        ErrorCode = "CONFLICT"
	ErrUnprocessable   ErrorCode = "UNPROCESSABLE_ENTITY"
	ErrRateLimit       ErrorCode = "RATE_LIMIT_EXCEEDED"
	ErrInternal        ErrorCode = "INTERNAL_SERVER_ERROR"
	ErrIdempotencyMiss ErrorCode = "IDEMPOTENCY_KEY_REQUIRED"
)

type ErrorDetail struct {
	Field string `json:"field,omitempty"`
	Issue string `json:"issue"`
}

type AppError struct {
	Code       ErrorCode     `json:"code"`
	Message    string        `json:"message"`
	Details    []ErrorDetail `json:"details,omitempty"`
	StatusCode int           `json:"-"`
	Err        error         `json:"-"`
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("[%s] %s: %v", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

func (e *AppError) Unwrap() error {
	return e.Err
}

func NewAppError(code ErrorCode, message string, statusCode int, err error) *AppError {
	return &AppError{
		Code:       code,
		Message:    message,
		StatusCode: statusCode,
		Err:        err,
		Details:    make([]ErrorDetail, 0),
	}
}

func Validation(message string, details []ErrorDetail) *AppError {
	return &AppError{
		Code:       ErrValidation,
		Message:    message,
		StatusCode: http.StatusBadRequest,
		Details:    details,
	}
}

func BadRequest(code ErrorCode, message string) *AppError {
	return &AppError{
		Code:       code,
		Message:    message,
		StatusCode: http.StatusBadRequest,
	}
}

func Unauthorized(message string) *AppError {
	return &AppError{
		Code:       ErrUnauthorized,
		Message:    message,
		StatusCode: http.StatusUnauthorized,
	}
}

func Forbidden(message string) *AppError {
	return &AppError{
		Code:       ErrForbidden,
		Message:    message,
		StatusCode: http.StatusForbidden,
	}
}

func NotFound(message string) *AppError {
	return &AppError{
		Code:       ErrNotFound,
		Message:    message,
		StatusCode: http.StatusNotFound,
	}
}

func Conflict(codeOrMessage string, optionalMsg ...string) *AppError {
	code := ErrConflict
	msg := codeOrMessage
	if len(optionalMsg) > 0 {
		code = ErrorCode(codeOrMessage)
		msg = optionalMsg[0]
	}
	return &AppError{
		Code:       code,
		Message:    msg,
		StatusCode: http.StatusConflict,
	}
}

func Unprocessable(codeOrMessage string, optionalMsg ...string) *AppError {
	code := ErrUnprocessable
	msg := codeOrMessage
	if len(optionalMsg) > 0 {
		code = ErrorCode(codeOrMessage)
		msg = optionalMsg[0]
	}
	return &AppError{
		Code:       code,
		Message:    msg,
		StatusCode: http.StatusUnprocessableEntity,
	}
}

func RateLimit(message string) *AppError {
	return &AppError{
		Code:       ErrRateLimit,
		Message:    message,
		StatusCode: http.StatusTooManyRequests,
	}
}

func TooManyRequests(message string) *AppError {
	return RateLimit(message)
}

func Internal(message string, err ...error) *AppError {
	var cause error
	if len(err) > 0 {
		cause = err[0]
	}
	return &AppError{
		Code:       ErrInternal,
		Message:    message,
		StatusCode: http.StatusInternalServerError,
		Err:        cause,
	}
}

type ErrorEnvelope struct {
	Error struct {
		Code      ErrorCode     `json:"code"`
		Message   string        `json:"message"`
		Details   []ErrorDetail `json:"details,omitempty"`
		RequestID string        `json:"requestId"`
	} `json:"error"`
}

// WriteJSON writes standardized ErrorEnvelope HTTP response
func WriteJSON(w http.ResponseWriter, r *http.Request, appErr *AppError) {
	reqID := r.Header.Get("X-Request-ID")
	if reqID == "" {
		reqID = "req_unknown"
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(appErr.StatusCode)

	resp := ErrorEnvelope{}
	resp.Error.Code = appErr.Code
	resp.Error.Message = appErr.Message
	resp.Error.Details = appErr.Details
	resp.Error.RequestID = reqID

	_ = json.NewEncoder(w).Encode(resp)
}
