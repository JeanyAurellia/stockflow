package category

type Category struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type CreateCategoryRequest struct {
	Name string `json:"name"`
}
