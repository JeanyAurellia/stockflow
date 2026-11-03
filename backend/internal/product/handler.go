package product

import (
	"encoding/json"
	"net/http"
	"strings"
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
	products, err := handler.repository.List(r.Context())
	if err != nil {
		http.Error(w, "failed to get products", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

func (handler *Handler) Create(w http.ResponseWriter, r *http.Request) {
	request := CreateProductRequest{}

	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	request.Name = strings.TrimSpace(request.Name)

	if request.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}

	if request.Price < 0 {
		http.Error(w, "price cannot be negative", http.StatusBadRequest)
		return
	}

	if request.Stock < 0 {
		http.Error(w, "stock quantity cannot be negative", http.StatusBadRequest)
		return
	}

	product, err := handler.repository.Create(
		r.Context(),
		request.CategoryID,
		request.Name,
		request.Description,
		request.Sku,
		request.Price,
		request.Stock,
	)
	if err != nil {
		http.Error(w, "failed to create product", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(product)
}
