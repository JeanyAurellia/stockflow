package inventory

import "time"

type Movement struct {
	ID             string    `json:"id"`
	ProductID      string    `json:"product_id"`
	MovementType   string    `json:"movement_type"`
	QuantityChange int       `json:"quantity_change"`
	Note           string    `json:"note"`
	CreatedAt      time.Time `json:"created_at"`
}

type CreateMovementRequest struct {
	MovementType   string `json:"movement_type"`
	QuantityChange int    `json:"quantity_change"`
	Note           string `json:"note"`
}