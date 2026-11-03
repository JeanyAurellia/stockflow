package product

type Product struct {
	ID string `json:"id"`
	CategoryID string `json:"category_id"`
	Name       string `json:"name"`
	Description string `json:"description"`
	Sku        string `json:"sku"`
	Price      float64 `json:"price"`
	Stock      int     `json:"stock_quantity"`
}

type CreateProductRequest struct {
	CategoryID string `json:"category_id"`
	Name       string `json:"name"`
	Description string `json:"description"`
	Sku        string `json:"sku"`
	Price      float64 `json:"price"`
	Stock      int     `json:"stock_quantity"`
}