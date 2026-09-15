# myITS Recap Backend

Backend REST API untuk frontend myITS Recap menggunakan **Go, Gin, GORM, dan PostgreSQL**.

## Menjalankan PostgreSQL

```bash
docker compose up -d
```

## Menjalankan API

```bash
cp .env.example .env
# isi JWT_SECRET untuk penggunaan non-demo
go mod tidy
go run ./cmd/server
```

API tersedia di `http://localhost:8080`.

## Endpoint utama

- `POST /api/auth/login`
- `GET /api/me`
- `GET|POST /api/classes`
- `PUT|DELETE /api/classes/:id`
- `POST /api/classes/:id/students`
- `DELETE /api/classes/:id/students/:studentId`
- `GET|POST /api/assignments`
- `PUT|DELETE /api/assignments/:id`
- `GET|POST /api/grades`
- `GET /api/students/:studentId/grades`

Semua endpoint `/api` selain login membutuhkan header:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Catatan penting

- `AutoMigrate` membuat dan memperbarui tabel secara otomatis untuk tahap pengembangan.
- Upload file belum disimpan ke object storage. Field `file_url` disiapkan untuk URL file.
- Frontend yang sekarang masih menggunakan data statis/localStorage. Agar benar-benar tersambung, ganti pemanggilan data statis dengan `fetch` ke API ini.
