package auth

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const claimsContextKey contextKey = "claims"

func RequireAuth(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authorization := r.Header.Get("Authorization")

			parts := strings.Fields(authorization)
			if len(parts) != 2 || parts[0] != "Bearer" {
				http.Error(w, "missing or invalid authorization header", http.StatusUnauthorized)
				return
			}

			claims := Claims{}

			token, err := jwt.ParseWithClaims(
				parts[1],
				&claims,
				func(token *jwt.Token) (interface{}, error) {
					_, ok := token.Method.(*jwt.SigningMethodHMAC)
					if !ok {
						return nil, errors.New("unexpected signing method")
					}

					return []byte(secret), nil
				},
			)

			if err != nil || !token.Valid {
				http.Error(w, "invalid or expired token", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), claimsContextKey, claims)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func UserIDFromContext(ctx context.Context) (string, bool) {
	claims, ok := ctx.Value(claimsContextKey).(Claims)
	if !ok || claims.Subject == "" {
		return "", false
	}

	return claims.Subject, true
}

func RequireRole(role string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := r.Context().Value(claimsContextKey).(Claims)
			if !ok || claims.Role != role {
				http.Error(w, "forbidden", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
