package order

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrProductNotFound = errors.New("product not found")
var ErrInsufficientStock = errors.New("insufficient stock")

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{
		pool: pool,
	}
}

func (repository *Repository) List(ctx context.Context) ([]Order, error) {
	rows, err := repository.pool.Query(
		ctx,
		`
			SELECT
				id::text,
				user_id::text,
				order_number,
				status,
				subtotal,
				total_amount,
				created_at
			FROM orders
			ORDER BY created_at DESC
		`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	orders := []Order{}
	for rows.Next() {
		order := Order{}
		err := rows.Scan(
			&order.ID,
			&order.UserID,
			&order.OrderNumber,
			&order.Status,
			&order.Subtotal,
			&order.TotalAmount,
			&order.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		order.Items, err = repository.ListItems(ctx, order.ID)
		if err != nil {
			return nil, err
		}

		orders = append(orders, order)
	}

	return orders, rows.Err()
}

func (repository *Repository) ListItems(ctx context.Context, orderID string) ([]OrderItem, error) {
	rows, err := repository.pool.Query(
		ctx,
		`
			SELECT
				id::text,
				product_id::text,
				product_name,
				unit_price,
				quantity,
				line_total
			FROM order_items
			WHERE order_id = $1
			ORDER BY product_name
		`,
		orderID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []OrderItem{}
	for rows.Next() {
		item := OrderItem{}
		err := rows.Scan(
			&item.ID,
			&item.ProductID,
			&item.ProductName,
			&item.UnitPrice,
			&item.Quantity,
			&item.LineTotal,
		)
		if err != nil {
			return nil, err
		}

		items = append(items, item)
	}

	return items, rows.Err()
}

func (repository *Repository) Create(
	ctx context.Context,
	request CreateOrderRequest,
) (Order, error) {
	transaction, err := repository.pool.Begin(ctx)
	if err != nil {
		return Order{}, err
	}
	defer transaction.Rollback(ctx)

	orderNumber := fmt.Sprintf("ORD-%d", time.Now().UnixNano())

	order := Order{}

	err = transaction.QueryRow(
		ctx,
		`
			INSERT INTO orders (user_id, order_number)
			VALUES ($1, $2)
			RETURNING
				id::text,
				user_id::text,
				order_number,
				status,
				subtotal,
				total_amount,
				created_at
		`,
		request.UserID,
		orderNumber,
	).Scan(
		&order.ID,
		&order.UserID,
		&order.OrderNumber,
		&order.Status,
		&order.Subtotal,
		&order.TotalAmount,
		&order.CreatedAt,
	)
	if err != nil {
		return Order{}, err
	}

	subtotal := float64(0)
	order.Items = []OrderItem{}

	for _, requestItem := range request.Items {
		productName := ""
		price := float64(0)
		stockQuantity := 0

		err = transaction.QueryRow(
			ctx,
			`
				SELECT name, price, stock_quantity
				FROM products
				WHERE id = $1 AND is_active = TRUE
				FOR UPDATE
			`,
			requestItem.ProductID,
		).Scan(&productName, &price, &stockQuantity)

		if errors.Is(err, pgx.ErrNoRows) {
			return Order{}, ErrProductNotFound
		}
		if err != nil {
			return Order{}, err
		}

		if stockQuantity < requestItem.Quantity {
			return Order{}, ErrInsufficientStock
		}

		_, err = transaction.Exec(
			ctx,
			`
				UPDATE products
				SET stock_quantity = stock_quantity - $1,
					updated_at = NOW()
				WHERE id = $2
			`,
			requestItem.Quantity,
			requestItem.ProductID,
		)
		if err != nil {
			return Order{}, err
		}

		lineTotal := price * float64(requestItem.Quantity)

		item := OrderItem{}

		err = transaction.QueryRow(
			ctx,
			`
				INSERT INTO order_items (
					order_id,
					product_id,
					product_name,
					unit_price,
					quantity,
					line_total
				)
				VALUES ($1, $2, $3, $4, $5, $6)
				RETURNING
					id::text,
					product_id::text,
					product_name,
					unit_price,
					quantity,
					line_total
			`,
			order.ID,
			requestItem.ProductID,
			productName,
			price,
			requestItem.Quantity,
			lineTotal,
		).Scan(
			&item.ID,
			&item.ProductID,
			&item.ProductName,
			&item.UnitPrice,
			&item.Quantity,
			&item.LineTotal,
		)
		if err != nil {
			return Order{}, err
		}

		_, err = transaction.Exec(
			ctx,
			`
				INSERT INTO inventory_movements (
					product_id,
					movement_type,
					quantity_change,
					reference_type,
					reference_id,
					note
				)
				VALUES ($1, 'sale', $2, 'order', $3, $4)
			`,
			requestItem.ProductID,
			-requestItem.Quantity,
			order.ID,
			order.OrderNumber,
		)
		if err != nil {
			return Order{}, err
		}

		subtotal += lineTotal
		order.Items = append(order.Items, item)
	}

	_, err = transaction.Exec(
		ctx,
		`
			UPDATE orders
			SET subtotal = $1,
				total_amount = $1,
				updated_at = NOW()
			WHERE id = $2
		`,
		subtotal,
		order.ID,
	)
	if err != nil {
		return Order{}, err
	}

	err = transaction.Commit(ctx)
	if err != nil {
		return Order{}, err
	}

	order.Subtotal = subtotal
	order.TotalAmount = subtotal

	return order, nil
}
