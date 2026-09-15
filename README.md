# EduPortal ITS - Frontend

Frontend awal untuk sistem rekap nilai mahasiswa dengan 3 role: Dosen, Asisten Dosen, dan Mahasiswa.

## Tech stack
- Next.js App Router + TypeScript
- pnpm
- Lucide React untuk icon
- CSS modular global tanpa dependency UI berat

Backend yang direncanakan dapat dihubungkan kemudian: Golang + Gin + GORM + PostgreSQL, dengan Swagger untuk dokumentasi API dan Bruno/Postman untuk testing.

## Fitur frontend
- Login email + password
- Mock role-based access untuk Dosen / Asisten Dosen / Mahasiswa
- Dosen: pilih kelas, input/edit nilai, CSV upload UI, kelola tugas, pilih kelas
- Komponen nilai Dosen: Tugas, ETS, EAS, Quiz 1-4, Final Project
- Asisten: Tugas, Keaktifan, Praktikum 1-5, Remidi 1-5, Final Praktikum
- Mahasiswa: daftar tugas + rekap nilai
- Mock data siap diganti dengan API

## Menjalankan
```bash
pnpm install
pnpm dev
```
Buka http://localhost:3000.

### Akun demo
Password demo: `demo123`
- Dosen: `dosen@its.ac.id`
- Asisten: `asisten@its.ac.id`
- Mahasiswa: `5025251001@student.its.ac.id`

Role saat ini ditentukan frontend hanya untuk preview. Pada implementasi backend, role harus dikirim dari hasil autentikasi server dan jangan dipercaya dari localStorage.
