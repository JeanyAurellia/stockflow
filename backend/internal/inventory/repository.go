package inventory

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrProductNotFoundorInsufficientStock = errors.New("product not found or insufficient stock")

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{
		pool: pool,
	}
}

func (repository *Repository) List(ctx context.Context, productID string) ([]Movement, error) {
	rows, err := repository.pool.Query(
		ctx,
		`
			SELECT
				id::text,
				product_id::text,
				movement_type,
				quantity_change,
				note,
				created_at
			FROM inventory_movements
			WHERE product_id = $1
			ORDER BY created_at DESC
		`,
		productID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	movements := []Movement{}
	for rows.Next() {
		movement := Movement{}
		err := rows.Scan(
			&movement.ID,
			&movement.ProductID,
			&movement.MovementType,
			&movement.QuantityChange,
			&movement.Note,
			&movement.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		movements = append(movements, movement)
	}

	return movements, rows.Err()
}

func (repository *Repository) Create(
	ctx context.Context,
	productID string,
	movementType string,
	quantityChange int,
	note string,
) (*Movement, error) {
	var movement Movement

	transaction, err := repository.pool.Begin(ctx)
	if err != nil {
		return &Movement{}, err
	}
	defer transaction.Rollback(ctx)

	result, err := transaction.Exec(
		ctx,
		`
			UPDATE products
			SET stock_quantity = stock_quantity + $1,
				updated_at = NOW()
			WHERE id = $2 AND (stock_quantity + $1) >= 0
		`,
		quantityChange,
		productID,
	)
	if err != nil {
		return &Movement{}, err
	}

	if result.RowsAffected() == 0 {
		return &Movement{}, ErrProductNotFoundorInsufficientStock
	}

	err = transaction.QueryRow(
		ctx,
		`
			INSERT INTO inventory_movements (product_id, movement_type, quantity_change, note)
			VALUES ($1, $2, $3, $4)
			RETURNING id::text, product_id::text, movement_type, quantity_change, note, created_at
		`,
		productID,
		movementType,
		quantityChange,
		note,
	).Scan(
		&movement.ID,
		&movement.ProductID,
		&movement.MovementType,
		&movement.QuantityChange,
		&movement.Note,
		&movement.CreatedAt,
	)
	if err != nil {
		return &Movement{}, err
	}

	err = transaction.Commit(ctx)
	if err != nil {
		return &Movement{}, err
	}

	return &movement, nil
}
