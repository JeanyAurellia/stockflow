# Stockflow

Stockflow adalah aplikasi inventaris sederhana untuk mencatat katalog produk, stok, dan pesanan. Proyek ini dibuat sebagai portofolio full-stack menggunakan Go, PostgreSQL, React, TypeScript, dan Tailwind CSS.

## Fitur

- Login berbasis JWT dan proteksi halaman frontend.
- Katalog produk beserta detail harga dan stok.
- Pembuatan kategori dan produk untuk akun admin.
- Pembuatan pesanan; backend memvalidasi stok dan menguranginya dalam transaksi database.
- Daftar pesanan untuk pengguna yang sedang login.

## Teknologi

- Backend: Go, Chi, pgx, PostgreSQL
- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router
- Development database: Docker Compose

## Menjalankan secara lokal

1. Jalankan PostgreSQL dari folder utama.

   ```bash
   docker compose up -d
   ```

2. Buat konfigurasi backend dari contoh.

   ```bash
   cd backend
   cp .env.example .env
   ```

   Ubah `DATABASE_URL` di `.env` agar memakai port Docker `5433`:

   ```env
   DATABASE_URL=postgres://inventory_user:inventory_password@localhost:5433/inventory_db?sslmode=disable
   ```

3. Jalankan migration.

   ```bash
   make migrate-up
   ```

4. Jalankan API pada terminal pertama.

   ```bash
   go run ./cmd/api
   ```

5. Pada terminal kedua, siapkan dan jalankan frontend.

   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```

Frontend tersedia di alamat yang ditampilkan Vite, biasanya `http://localhost:5173`. API berjalan di `http://localhost:8080`.

## Pemeriksaan kualitas

```bash
# backend
cd backend && go test ./...

# frontend
cd frontend && npm run lint && npm run build
```

## Catatan akses

Endpoint dan halaman katalog admin membutuhkan akun dengan role `admin`. Halaman lainnya hanya membutuhkan pengguna yang sudah login.
