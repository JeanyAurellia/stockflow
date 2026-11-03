package user

import (
	"context"
	"errors"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

var ErrInvalidCredentials = errors.New("invalid email or password")

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{
		repository: repository,
	}
}

func (service *Service) Register(
	ctx context.Context,
	request RegisterRequest,
) (User, error) {
	request.Email = strings.TrimSpace(request.Email)
	request.FullName = strings.TrimSpace(request.FullName)

	if request.Email == "" {
		return User{}, errors.New("email is required")
	}

	if request.FullName == "" {
		return User{}, errors.New("full name is required")
	}

	if len(request.Password) < 8 {
		return User{}, errors.New("password must be at least 8 characters")
	}

	passwordHash, err := bcrypt.GenerateFromPassword(
		[]byte(request.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return User{}, err
	}

	return service.repository.Create(
		ctx,
		request.Email,
		request.FullName,
		string(passwordHash),
	)
}

func (service *Service) Login(
	ctx context.Context,
	request LoginRequest,
) (User, error) {
	storedUser, err := service.repository.FindByEmail(
		ctx,
		strings.TrimSpace(request.Email),
	)
	if err != nil {
		return User{}, ErrInvalidCredentials
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(storedUser.PasswordHash),
		[]byte(request.Password),
	)
	if err != nil {
		return User{}, ErrInvalidCredentials
	}

	return storedUser.User, nil
}