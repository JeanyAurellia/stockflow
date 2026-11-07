package category

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
	categories, err := handler.repository.List(r.Context())
	if err != nil {
		http.Error(w, "failed to get categories", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}

func (handler *Handler) Create(w http.ResponseWriter, r *http.Request) {
	request := CreateCategoryRequest{}

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

	category, err := handler.repository.Create(r.Context(), request.Name)
	if err != nil {
		http.Error(w, "failed to create category", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(category)
}
