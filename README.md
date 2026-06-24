# UTBK Belajar

Aplikasi web sederhana untuk belajar soal UTBK.
Satu soal, satu jawaban, satu pembahasan. Fokus.

---

## Cara Menjalankan

### Prasyarat

- [Bun](https://bun.sh) v1.3+
- MariaDB / MySQL 8
- Database `utbk_belajar` sudah dibuat

### Setup Awal

```bash
# 1. Masuk ke direktori project
cd utbk2

# 2. Install semua dependency
cd backend && bun install && cd ../frontend && bun install && cd ..

# 3. Setup database
cd backend
bun run db:generate    # Generate migrasi
bun run db:migrate     # Jalankan migrasi
bun run seed           # Isi database dengan soal awal
cd ..

# 4. Jalankan — satu perintah untuk backend + frontend
bun run dev

# Buka http://localhost:5173
```

Backend berjalan di `http://localhost:3000`, frontend di `http://localhost:5173`.

### Konfigurasi

Edit file `.env` di root project:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password-anda
DB_NAME=utbk_belajar
APP_PORT=3000
```

---

## Cara Pakai

### 1. Pilih Mata Uji

Di halaman utama, pilih salah satu mata uji UTBK:

- **TPS** -- Tes Potensi Skolastik
- **Literasi Bahasa Indonesia**
- **Literasi Bahasa Inggris**
- **Penalaran Matematika**

### 2. Pilih Topik

Setiap mata uji memiliki beberapa topik. Contoh di TPS:

- Penalaran Umum
- Pengetahuan Kuantitatif

Klik topik yang ingin dikerjakan.

### 3. Kerjakan Soal

- Soal muncul secara acak dari topik yang dipilih
- Timer otomatis mulai menghitung
- Baca soal, pilih jawaban
- Klik **"Selesai"** jika sudah yakin

### 4. Lihat Pembahasan

Setelah klik Selesai:
- Status **Benar** atau **Salah** ditampilkan
- Waktu pengerjaan ditampilkan
- Kunci jawaban ditampilkan
- Pembahasan lengkap ditampilkan

Klik **"Soal Berikutnya"** untuk lanjut ke soal acak berikutnya.

### 5. Ganti Topik

Klik **"Ganti Topik"** di kiri atas halaman quiz untuk kembali ke daftar topik.

---

## Tipe Soal

| Tipe | Keterangan | Cara Jawab |
|---|---|---|
| Pilihan Ganda | `single_choice` | Pilih satu dari 4-5 opsi |
| Pilihan Ganda Kompleks | `multiple_response` | Centang semua jawaban benar (bisa lebih dari satu) |
| Benar - Salah | `true_false` | Pilih Benar atau Salah |

**Aturan penilaian:**
- Pilihan Ganda: jawaban tepat = benar
- Pilihan Ganda Kompleks: semua opsi benar harus terpilih, tidak boleh ada opsi salah terpilih *(all-or-nothing)*
- Benar - Salah: pilih tepat = benar

---

## Menambah Soal

Soal disimpan di file `seed.json` di root project. Formatnya:

```json
{
  "subjects": [
    { "slug": "tps", "label": "TPS", "display_order": 1 }
  ],
  "topics": [
    { "slug": "penalaran-umum", "subject_slug": "tps", "label": "Penalaran Umum", "display_order": 1 }
  ],
  "questions": [
    {
      "topic_slug": "penalaran-umum",
      "type": "single_choice",
      "difficulty": "medium",
      "question_text": "Isi soal...",
      "explanation_text": "Pembahasan...",
      "options": [
        { "key": "A", "text": "Pilihan A", "is_correct": false },
        { "key": "B", "text": "Pilihan B", "is_correct": true },
        { "key": "C", "text": "Pilihan C", "is_correct": false },
        { "key": "D", "text": "Pilihan D", "is_correct": false }
      ]
    }
  ]
}
```

**Setelah mengedit `seed.json`, jalankan dari root project:**

```bash
bun run seed
```

Script seed bersifat idempotent -- soal yang sudah ada tidak akan diduplikasi.

### Tips menambah soal dengan AI

Minta AI untuk menghasilkan soal dalam format di atas. Contoh prompt:

```
Buatkan 5 soal UTBK tipe single_choice tentang Penalaran Umum 
dalam format JSON. Subject: TPS, Topic: penalaran-umum.
Setiap soal punya 4 opsi (A-D), satu jawaban benar, 
dan pembahasan singkat. Difficulty: campur easy/medium/hard.
```

---

## Arsitektur

```
┌──────────┐     HTTP/JSON     ┌──────────┐     MySQL     ┌──────────┐
│  Vue 3   │ ◄───────────────► │   Hono   │ ◄───────────► │ MariaDB  │
│  (5173)  │     /api/*        │  (3000)  │               │  (3306)  │
└──────────┘                   └──────────┘               └──────────┘
```

**Backend:** Hono (Bun) + Drizzle ORM + Zod
**Frontend:** Vue 3 (Composition API) + Vue Router
**Testing:** Vitest (30 test, 100% passing)

### Struktur Database

```
subjects ──< topics ──< questions ──< question_options
```

4 tabel, relasi one-to-many, tanpa tabel riwayat/history.

### API Endpoints

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/subjects` | Daftar mata uji |
| GET | `/api/topics?subject_id=` | Daftar topik |
| GET | `/api/questions/random?topic_id=` | Soal acak |
| POST | `/api/questions/:id/check` | Koreksi jawaban |

---

## Pengembangan

### Perintah dari Root

Semua perintah berikut dijalankan dari root project (`utbk2/`):

```bash
bun run dev          # Jalankan backend + frontend (satu perintah)
bun run seed         # Inject soal dari seed.json
bun run test         # Test backend + frontend
bun run typecheck    # TypeScript check backend + frontend
bun run db:migrate   # Jalankan migrasi database
```

### Menjalankan Test per Package

```bash
# Dari root project:
bun run test

# Atau per package:
cd backend && bun run test
cd frontend && bun run test
```

### Struktur Project

```
utbk2/
├── RULES.md              # Aturan project (wajib baca)
├── seed.json             # Bank soal
├── .env                  # Konfigurasi
├── backend/              # API server
│   └── src/
│       ├── db/schema/    # Drizzle schema
│       ├── routes/       # API endpoint handlers
│       └── lib/          # Utils (scoring, seed)
└── frontend/             # Vue SPA
    └── src/
        ├── views/        # Halaman (Home, Topic, Quiz)
        ├── components/   # Komponen (Timer, Options, dll)
        ├── api/          # HTTP client
        └── types/        # TypeScript interfaces
```

---

## FAQ

**Q: Kenapa tidak ada login?**
A: Aplikasi ini dirancang untuk single-user lokal. Tidak perlu autentikasi.

**Q: Kenapa tidak ada riwayat nilai?**
A: Fokus aplikasi adalah latihan per soal dengan pembahasan langsung. Riwayat bisa ditambahkan di versi berikutnya.

**Q: Bisakah menambah soal lewat UI?**
A: Versi saat ini soal dimasukkan via `seed.json` + command `bun run seed`. UI admin bisa ditambahkan nanti.

**Q: Timer-nya countdown atau stopwatch?**
A: Stopwatch -- menghitung waktu dari soal muncul sampai user klik Selesai. Tidak ada batas waktu.

**Q: Soalnya muncul acak atau urut?**
A: Acak. Setiap kali klik topik, satu soal random dari topik itu ditampilkan.

**Q: Apakah soal yang sudah dikerjakan bisa muncul lagi?**
A: Ya, karena tidak ada riwayat, soal yang sama bisa muncul lagi di sesi berbeda.

---

## Lisensi

Private -- untuk penggunaan pribadi.
