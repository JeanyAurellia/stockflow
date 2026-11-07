package category

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{
		pool: pool,
	}
}

func (repository *Repository) List(ctx context.Context) ([]Category, error) {
	query := `
		SELECT id::text, name
		FROM categories
		ORDER BY name
	`

	rows, err := repository.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	categories := []Category{}

	for rows.Next() {
		category := Category{}

		err := rows.Scan(&category.ID, &category.Name)
		if err != nil {
			return nil, err
		}

		categories = append(categories, category)
	}

	return categories, rows.Err()
}

func (repository *Repository) Create(
	ctx context.Context,
	name string,
) (Category, error) {
	query := `
		INSERT INTO categories (name)
		VALUES ($1)
		RETURNING id::text, name
	`

	category := Category{}

	err := repository.pool.QueryRow(ctx, query, name).Scan(
		&category.ID,
		&category.Name,
	)
	if err != nil {
		return Category{}, err
	}

	return category, nil
}
