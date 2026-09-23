[# myITS Recap]([url](https://its.id/m/MyITS-Recap))

**myITS Recap** adalah aplikasi web untuk membantu proses pengelolaan kelas, tugas, nilai, dan rekap nilai mahasiswa secara terintegrasi.

Aplikasi ini memiliki tiga jenis pengguna, yaitu **Dosen**, **Asisten Dosen**, dan **Mahasiswa**, dengan hak akses dan fitur yang berbeda untuk setiap role.

---

## Features

### Authentication
- Login menggunakan email dan password
- Authentication menggunakan JWT
- Role-based access untuk Dosen, Asisten Dosen, dan Mahasiswa
- Logout dan session management

### Dosen
- Melihat dan mengelola kelas
- Menambahkan, mengedit, dan menghapus kelas
- Menambahkan dan menghapus mahasiswa dari kelas
- Mengelola tugas
- Upload file tugas
- Edit dan hapus tugas
- Menginput nilai mahasiswa
- Menyimpan nilai sebagai **Draft**
- Publish dan Unpublish nilai
- Upload nilai menggunakan CSV
- Melihat rekap nilai mahasiswa

### Asisten Dosen
- Melihat kelas yang tersedia
- Menginput nilai mahasiswa
- Mengelola komponen:
  - Keaktifan
  - Praktikum 1–5
  - Remidi 1–5
  - Final Praktikum
  - Tugas
- Nilai Keaktifan, Praktikum, Remidi, dan Final Praktikum dapat langsung dipublikasikan

### Mahasiswa
- Melihat kelas yang diikuti
- Melihat daftar tugas
- Download file tugas
- Melihat rekap nilai berdasarkan mata kuliah
- Melihat status nilai:
  - Sudah dinilai
  - Belum dinilai
- Melihat nilai yang sudah dipublikasikan
- Melihat rata-rata nilai dari nilai yang telah dipublikasikan

### Dashboard
Dashboard menampilkan informasi yang disesuaikan dengan role pengguna.

**Dosen / Asisten Dosen**
- Jumlah kelas
- Informasi tugas
- Informasi nilai

**Mahasiswa**
- Jumlah mata kuliah yang diikuti
- Tugas terbaru dari kelas yang diikuti
- Ringkasan nilai

---

## Tech Stack

### Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- React
- pnpm

### Backend
- Go
- Gin
- GORM
- JWT Authentication

### Database
- PostgreSQL

### Development Tools
- Docker
- Git & GitHub
- VS Code

---

## Project Structure

```text
FP-LBE-Alpro/
├── Backend/
│   ├── internal/
│   │   ├── database/
│   │   ├── handlers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── router/
│   ├── uploads/
│   ├── .env
│   ├── go.mod
│   └── ...
│
├── Frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── dosen/
│   │   ├── asisten/
│   │   ├── mahasiswa/
│   │   └── login/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── .env.local
│   ├── package.json
│   └── ...
│
└── README.md
