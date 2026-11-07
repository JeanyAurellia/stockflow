package order

import "time"

type OrderItem struct {
	ID          string  `json:"id"`
	ProductID   string  `json:"product_id"`
	ProductName string  `json:"product_name"`
	UnitPrice   float64 `json:"unit_price"`
	Quantity    int     `json:"quantity"`
	LineTotal   float64 `json:"line_total"`
}

type Order struct {
	ID          string      `json:"id"`
	UserID      string      `json:"user_id"`
	OrderNumber string      `json:"order_number"`
	Status      string      `json:"status"`
	Subtotal    float64     `json:"subtotal"`
	TotalAmount float64     `json:"total_amount"`
	CreatedAt   time.Time   `json:"created_at"`
	Items       []OrderItem `json:"items"`
}

type CreateOrderItemRequest struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}

type CreateOrderRequest struct {
	UserID string                   `json:"user_id"`
	Items  []CreateOrderItemRequest `json:"items"`
}
