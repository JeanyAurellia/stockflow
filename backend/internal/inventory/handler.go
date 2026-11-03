package inventory

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	repository *Repository
}

func NewHandler(repository *Repository) *Handler {
	return &Handler{
		repository: repository,
	}
}

func (handler *Handler) List(w http.ResponseWriter, r *http.Request) {
	productID := chi.URLParam(r, "id")

	movements, err := handler.repository.List(r.Context(), productID)
	if err != nil {
		http.Error(w, "failed to get inventory history", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(movements)
}

func (handler *Handler) Create(w http.ResponseWriter, r *http.Request) {
	productID := chi.URLParam(r, "id")

	request := CreateMovementRequest{}

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	request.MovementType = strings.TrimSpace(request.MovementType)
	request.Note = strings.TrimSpace(request.Note)

	if request.QuantityChange == 0 {
		http.Error(w, "quantity change cannot be zero", http.StatusBadRequest)
		return
	}

	if !isValidMovementType(request.MovementType) {
		http.Error(w, "movement type must be restock, sale, adjustment, or return", http.StatusBadRequest)
		return
	}

	movement, err := handler.repository.Create(
		r.Context(),
		productID,
		request.MovementType,
		request.QuantityChange,
		request.Note,
	)
	if err != nil {
		if errors.Is(err, ErrProductNotFoundorInsufficientStock) {
			http.Error(w, "product not found or insufficient stock", http.StatusBadRequest)
			return
		}

		http.Error(w, "failed to update stock", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(movement)
}

func isValidMovementType(movementType string) bool {
	switch movementType {
	case "restock", "sale", "adjustment", "return":
		return true
	default:
		return false
	}
}
