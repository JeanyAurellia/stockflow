package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"github.com/JeanyAurellia/stockflow/backend/internal/category"
	"github.com/JeanyAurellia/stockflow/backend/internal/database"
	"github.com/JeanyAurellia/stockflow/backend/internal/inventory"
	"github.com/JeanyAurellia/stockflow/backend/internal/product"
	"github.com/JeanyAurellia/stockflow/backend/internal/user"
)

var databasePool *pgxpool.Pool

func main() {
	// Membaca file .env agar nilai seperti DATABASE_URL bisa digunakan oleh aplikasi.
	// Jika file .env tidak ada, aplikasi tetap mencoba membaca environment variable dari sistem.
	if err := godotenv.Load(); err != nil && !os.IsNotExist(err) {
		// Hentikan aplikasi jika .env ada tetapi gagal dibaca.
		log.Fatalf("load .env: %v", err)
	}

	// Mengambil alamat koneksi PostgreSQL dari .env.
	databaseURL := os.Getenv("DATABASE_URL")
	// Tanpa alamat database, aplikasi tidak tahu harus terhubung ke mana.
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	// Membuka koneksi ke PostgreSQL dan sekaligus memeriksa apakah database dapat dihubungi.
	// context.Background() dipakai sebagai context dasar saat aplikasi baru mulai.
	pool, err := database.Open(context.Background(), databaseURL)
	if err != nil {
		// Hentikan aplikasi bila koneksi database gagal, misalnya PostgreSQL belum berjalan.
		log.Fatalf("connect to database: %v", err)
	}
	// Menutup koneksi database secara otomatis ketika aplikasi dihentikan.
	defer pool.Close()

	// Menyimpan koneksi agar fungsi healthCheck dapat memakainya nanti.
	databasePool = pool

	// Membuat router: bagian yang menentukan URL mana menjalankan fungsi apa.
	router := chi.NewRouter()
	// Saat seseorang membuka GET /health, jalankan fungsi healthCheck.
	router.Get("/health", healthCheck)

	categoryRepository := category.NewRepository(pool)
	categoryHandler := category.NewHandler(categoryRepository)

	router.Get("/categories", categoryHandler.List)
	router.Post("/categories", categoryHandler.Create)

	productRepository := product.NewRepository(pool)
	productHandler := product.NewHandler(productRepository)

	router.Get("/products", productHandler.List)
	router.Post("/products", productHandler.Create)

	inventoryRepository := inventory.NewRepository(pool)
	inventoryHandler := inventory.NewHandler(inventoryRepository)

	router.Get("/products/{id}/inventory", inventoryHandler.List)
	router.Post("/products/{id}/inventory", inventoryHandler.Create)

	userRepository := user.NewRepository(pool)
	userService := user.NewService(userRepository)
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is required")
	}

	userHandler := user.NewHandler(userService, jwtSecret)

	router.Post("/register", userHandler.Register)
	router.Post("/login", userHandler.Login)

	// Mengambil port dari .env, misalnya APP_PORT=8080.
	port := os.Getenv("APP_PORT")
	// Jika APP_PORT belum diatur, gunakan port 8080 sebagai nilai bawaan.
	if port == "" {
		port = "8080"
	}

	// Menampilkan alamat server di terminal agar kita tahu API sudah mulai berjalan.
	log.Printf("API listening on http://localhost:%s", port)
	// Menyalakan web server. Baris ini terus berjalan sampai aplikasi dihentikan dengan Ctrl+C.
	if err := http.ListenAndServe(":"+port, router); err != nil {
		// Tampilkan alasan bila server gagal berjalan, misalnya port sedang dipakai aplikasi lain.
		log.Fatalf("run server: %v", err)
	}
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
	err := databasePool.Ping(r.Context())
	if err != nil {
		response := map[string]string{
			"status":   "unavailable",
			"database": "disconnected",
		}
		writeJSON(w, http.StatusServiceUnavailable, response)
		return
	}

	response := map[string]string{
		"status":   "ok",
		"database": "connected",
	}
	writeJSON(w, http.StatusOK, response)
}

func writeJSON(w http.ResponseWriter, status int, body map[string]string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(body); err != nil {
		log.Printf("write JSON response: %v", err)
	}
}
