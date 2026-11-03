package user

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/JeanyAurellia/stockflow/backend/internal/auth"
)

type Handler struct {
	service   *Service
	jwtSecret string
}

func NewHandler(service *Service, jwtSecret string) *Handler {
	return &Handler{
		service:   service,
		jwtSecret: jwtSecret,
	}
}

func (handler *Handler) Register(w http.ResponseWriter, r *http.Request) {
	request := RegisterRequest{}

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	user, err := handler.service.Register(r.Context(), request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(user)
}

func (handler *Handler) Login(w http.ResponseWriter, r *http.Request) {
	request := LoginRequest{}

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	user, err := handler.service.Login(r.Context(), request)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) {
			http.Error(w, "invalid email or password", http.StatusUnauthorized)
			return
		}

		http.Error(w, "failed to login", http.StatusInternalServerError)
		return
	}

	token, err := auth.GenerateToken(
		user.ID,
		user.Role,
		handler.jwtSecret,
	)
	if err != nil {
		http.Error(w, "failed to create token", http.StatusInternalServerError)
		return
	}

	response := LoginResponse{
		AccessToken: token,
		User:        user,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(response)
}
