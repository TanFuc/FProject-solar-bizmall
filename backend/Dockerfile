# Multi-stage Dockerfile for BM SOLAR Backend (Golang)
FROM golang:1.24-alpine AS builder

WORKDIR /src

# Install git and ca-certificates
RUN apk add --no-cache git ca-certificates tzdata

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build statically linked binaries
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /out/bmsolar-server ./cmd/server
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /out/bmsolar-seed ./cmd/seed

# Production minimal container
FROM alpine:3.21

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -S bmsolar && adduser -S bmsolar -G bmsolar \
    && mkdir -p /app/uploads \
    && chown -R bmsolar:bmsolar /app

COPY --from=builder /out/bmsolar-server /app/bmsolar-server
COPY --from=builder /out/bmsolar-seed /app/bmsolar-seed

USER bmsolar

ENV PORT=3001
ENV APP_ENV=production
ENV STORAGE_DIR=/app/uploads

EXPOSE 3001

CMD ["/app/bmsolar-server"]
