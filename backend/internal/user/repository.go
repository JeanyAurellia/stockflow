package user

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

func (repository *Repository) Create(
	ctx context.Context,
	email string,
	fullName string,
	passwordHash string,
) (User, error) {
	query := `
		INSERT INTO users (email, full_name, password_hash)
		VALUES ($1, $2, $3)
		RETURNING id::text, email, full_name, role, created_at
	`

	user := User{}

	err := repository.pool.QueryRow(
		ctx,
		query,
		email,
		fullName,
		passwordHash,
	).Scan(
		&user.ID,
		&user.Email,
		&user.FullName,
		&user.Role,
		&user.CreatedAt,
	)
	if err != nil {
		return User{}, err
	}

	return user, nil
}

func (repository *Repository) FindByEmail(
	ctx context.Context,
	email string,
) (UserWithPassword, error) {
	query := `
		SELECT
			id::text,
			email,
			full_name,
			role,
			created_at,
			password_hash
		FROM users
		WHERE email = $1
	`

	user := UserWithPassword{}

	err := repository.pool.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.FullName,
		&user.Role,
		&user.CreatedAt,
		&user.PasswordHash,
	)
	if err != nil {
		return UserWithPassword{}, err
	}

	return user, nil
}