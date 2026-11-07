package product

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("product not found")

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{
		pool: pool,
	}
}

func (repository *Repository) List(ctx context.Context) ([]Product, error) {
	query := `
		SELECT id::text, category_id::text, name, description, sku, price, stock_quantity
		FROM products
		ORDER BY name
	`

	rows, err := repository.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	products := []Product{}

	for rows.Next() {
		product := Product{}

		err := rows.Scan(
			&product.ID,
			&product.CategoryID,
			&product.Name,
			&product.Description,
			&product.Sku,
			&product.Price,
			&product.Stock,
		)
		if err != nil {
			return nil, err
		}

		products = append(products, product)
	}

	return products, rows.Err()
}

func (repository *Repository) Get(ctx context.Context, id string) (Product, error) {
	query := `
		SELECT id::text, category_id::text, name, description, sku, price, stock_quantity
		FROM products
		WHERE id = $1
	`

	product := Product{}
	err := repository.pool.QueryRow(ctx, query, id).Scan(
		&product.ID,
		&product.CategoryID,
		&product.Name,
		&product.Description,
		&product.Sku,
		&product.Price,
		&product.Stock,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return Product{}, ErrNotFound
	}
	if err != nil {
		return Product{}, err
	}

	return product, nil
}

func (repository *Repository) Create(
	ctx context.Context,
	categoryID string,
	name string,
	description string,
	sku string,
	price float64,
	stock int,
) (Product, error) {
	query := `
		INSERT INTO products (category_id, name, description, sku, price, stock_quantity)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id::text, category_id, name, description, sku, price, stock_quantity
	`

	product := Product{}

	err := repository.pool.QueryRow(ctx, query, categoryID, name, description, sku, price, stock).Scan(
		&product.ID,
		&product.CategoryID,
		&product.Name,
		&product.Description,
		&product.Sku,
		&product.Price,
		&product.Stock,
	)
	if err != nil {
		return Product{}, err
	}

	return product, nil
}
