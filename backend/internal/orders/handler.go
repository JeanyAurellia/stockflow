package order

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/JeanyAurellia/stockflow/backend/internal/auth"
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
	orders, err := handler.repository.List(r.Context())
	if err != nil {
		http.Error(w, "failed to get orders", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(orders)
}

func (handler *Handler) Create(w http.ResponseWriter, r *http.Request) {
	request := CreateOrderRequest{}

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	request.UserID = userID

	if len(request.Items) == 0 {
		http.Error(w, "order items are required", http.StatusBadRequest)
		return
	}

	for _, item := range request.Items {
		if item.ProductID == "" {
			http.Error(w, "product_id is required", http.StatusBadRequest)
			return
		}

		if item.Quantity <= 0 {
			http.Error(w, "quantity must be greater than zero", http.StatusBadRequest)
			return
		}
	}

	order, err := handler.repository.Create(r.Context(), request)
	if err != nil {
		if errors.Is(err, ErrProductNotFound) {
			http.Error(w, "product not found", http.StatusNotFound)
			return
		}

		if errors.Is(err, ErrInsufficientStock) {
			http.Error(w, "insufficient stock", http.StatusBadRequest)
			return
		}

		http.Error(w, "failed to create order", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(order)
}
