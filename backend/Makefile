MIGRATE := $(HOME)/go/bin/migrate
MIGRATIONS_PATH := migrations

include .env
export

.PHONY: migrate-up migrate-down migrate-version

migrate-up:
	$(MIGRATE) -path $(MIGRATIONS_PATH) -database "$(DATABASE_URL)" up

migrate-down:
	$(MIGRATE) -path $(MIGRATIONS_PATH) -database "$(DATABASE_URL)" down 1

migrate-version:
	$(MIGRATE) -path $(MIGRATIONS_PATH) -database "$(DATABASE_URL)" version
