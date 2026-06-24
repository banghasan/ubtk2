# KONSEP APLIKASI: UTBK Belajar

> Dokumen ini mendefinisikan konsep, ruang lingkup, dan keputusan arsitektur
> untuk aplikasi belajar soal UTBK.

---

## 1. Ringkasan

Aplikasi web belajar soal UTBK dengan alur sangat sederhana:
pilih topik -> dapat soal acak -> timer (start/stop) -> jawab -> lihat pembahasan -> lanjut.

- Single-user, tanpa login
- Tanpa riwayat atau skor tersimpan
- Fokus pada latihan per soal dengan pembahasan langsung

---

## 2. Stack Teknis

| Layer | Teknologi | Versi |
|---|---|---|
| Runtime | Bun | 1.3.x |
| Backend framework | Hono | ^4.8 |
| Database | MariaDB / MySQL 8 | |
| ORM | Drizzle ORM | |
| Validasi | Zod | |
| Frontend framework | Vue 3 (Composition API) | |
| Router | Vue Router | |
| Testing | Vitest | |
| Build tool | Vite | |

---

## 3. Struktur Folder

```
utbk2/
├── .env                  # Konfigurasi lingkungan
├── seed.json             # Data soal untuk seed awal
├── KONSEP.md             # Dokumen ini
├── RENCANA.md            # Rencana eksekusi
├── STRUKTUR.md           # Referensi struktur direktori
│
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema/
│   │   │   │   ├── subjects.ts
│   │   │   │   ├── topics.ts
│   │   │   │   ├── questions.ts
│   │   │   │   └── question-options.ts
│   │   │   ├── connection.ts      # Koneksi pool database
│   │   │   └── migrate.ts         # Runner migrasi
│   │   ├── routes/
│   │   │   ├── subjects.ts
│   │   │   ├── topics.ts
│   │   │   └── questions.ts
│   │   ├── lib/
│   │   │   ├── scoring.ts         # Logika koreksi jawaban
│   │   │   └── seed.ts            # Fungsi seed database
│   │   ├── index.ts               # Entry point
│   │   └── app.ts                 # Hono app factory
│   ├── src/__tests__/
│   │   ├── routes/
│   │   │   ├── subjects.test.ts
│   │   │   ├── topics.test.ts
│   │   │   └── questions.test.ts
│   │   └── lib/
│   │       └── scoring.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
│
├── frontend/
│   ├── src/
│   │   ├── views/
│   │   │   ├── HomeView.vue       # Landing: pilih subject
│   │   │   ├── TopicView.vue      # Pilih topic dalam subject
│   │   │   └── QuizView.vue       # Soal + timer + pembahasan
│   │   ├── components/
│   │   │   ├── QuestionCard.vue    # Tampilan soal
│   │   │   ├── TimerBar.vue        # Timer start/stop display
│   │   │   ├── OptionList.vue      # Opsi jawaban
│   │   │   └── ExplanationPanel.vue # Pembahasan setelah jawab
│   │   ├── router/
│   │   │   └── index.ts
│   │   ├── api/
│   │   │   └── client.ts          # HTTP client
│   │   ├── App.vue
│   │   └── main.ts
│   ├── src/__tests__/
│   │   ├── views/
│   │   │   ├── HomeView.test.ts
│   │   │   ├── TopicView.test.ts
│   │   │   └── QuizView.test.ts
│   │   └── components/
│   │       ├── TimerBar.test.ts
│   │       ├── OptionList.test.ts
│   │       └── ExplanationPanel.test.ts
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── vite.config.ts
```

---

## 4. Model Data

### 4.1 Entity Relationship

```
Subject 1---* Topic 1---* Question 1---* QuestionOption
```

### 4.2 subjects

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | int (serial) | PK | |
| slug | varchar(50) | UNIQUE, NOT NULL | `tps`, `literasi-bahasa-indonesia` |
| label | varchar(100) | NOT NULL | "TPS", "Literasi Bahasa Indonesia" |
| display_order | int | NOT NULL | |

### 4.3 topics

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | int (serial) | PK | |
| subject_id | int | FK -> subjects.id, NOT NULL | |
| slug | varchar(50) | UNIQUE, NOT NULL | `penalaran-umum` |
| label | varchar(100) | NOT NULL | "Penalaran Umum" |
| display_order | int | NOT NULL | |

### 4.4 questions

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | int (serial) | PK | |
| topic_id | int | FK -> topics.id, NOT NULL | |
| type | varchar(20) | NOT NULL | `single_choice`, `multiple_response`, `true_false` |
| difficulty | varchar(10) | NOT NULL | `easy`, `medium`, `hard` |
| question_text | text | NOT NULL | Isi soal |
| explanation_text | text | NOT NULL | Pembahasan |
| created_at | timestamp | default now() | |

### 4.5 question_options

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | int (serial) | PK | |
| question_id | int | FK -> questions.id, NOT NULL | |
| option_key | varchar(5) | NOT NULL | `A`, `B`, `C`, `D`, `true`, `false` |
| option_text | text | NOT NULL | Teks opsi |
| is_correct | boolean | NOT NULL | Kunci jawaban |
| display_order | int | NOT NULL | |

---

## 5. API Endpoints

### `GET /api/subjects`
Mengembalikan semua subject terurut `display_order`.
```json
{
  "subjects": [
    { "id": 1, "slug": "tps", "label": "TPS", "display_order": 1 }
  ]
}
```

### `GET /api/topics?subject_id=<id>`
Mengembalikan topic milik suatu subject.
```json
{
  "topics": [
    { "id": 1, "subject_id": 1, "slug": "penalaran-umum", "label": "Penalaran Umum", "display_order": 1 }
  ]
}
```

### `GET /api/questions/random?topic_id=<id>`
Ambil 1 soal acak dari topic. Opsi tidak menyertakan is_correct.

Response jika ada soal:
```json
{
  "question": {
    "id": 10,
    "type": "single_choice",
    "difficulty": "medium",
    "question_text": "Manakah pernyataan yang tepat?",
    "options": [
      { "key": "A", "text": "Pernyataan 1" },
      { "key": "B", "text": "Pernyataan 2" },
      { "key": "C", "text": "Pernyataan 3" },
      { "key": "D", "text": "Pernyataan 4" }
    ]
  }
}
```

Response jika tidak ada soal (semua sudah dijawab sesi ini atau topik kosong):
```json
{
  "question": null,
  "message": "Tidak ada soal lagi untuk topik ini."
}
```

### `POST /api/questions/:id/check`
Mengecek jawaban.

Request:
```json
{
  "selected_keys": ["B"]
}
```

Response (benar):
```json
{
  "correct": true,
  "correct_keys": ["B"],
  "explanation": "Pembahasan lengkap..."
}
```

Response (salah):
```json
{
  "correct": false,
  "correct_keys": ["B"],
  "explanation": "Pembahasan lengkap..."
}
```

**Catatan tipe soal:**
- `single_choice`: `selected_keys` berisi 1 elemen
- `multiple_response`: `selected_keys` berisi 1+ elemen, evaluasi all-or-nothing
- `true_false`: `selected_keys` berisi `["true"]` atau `["false"]`

---

## 6. Alur Pengguna (User Flow)

```
                        +------------------+
                        |  HOMEPAGE         |
                        |  (Daftar Subject) |
                        +--------+---------+
                                 |
                                 v
                        +------------------+
                        |  TOPIK PAGE       |
                        |  (Pilih Topic)    |
                        +--------+---------+
                                 |
                                 v
            +-------------------------------------------+
            |  QUIZ PAGE                                 |
            |                                            |
            |  1. Soal ditampilkan + Timer auto-start    |
            |  2. User baca soal & pilih jawaban         |
            |  3. User klik "Selesai"                    |
            |  4. Timer berhenti                         |
            |  5. Jawaban dikirim ke API /check          |
            |  6. Tampilkan:                             |
            |     - Status (Benar/Salah)                 |
            |     - Waktu tempuh                         |
            |     - Kunci jawaban                        |
            |     - Pembahasan                           |
            |  7. User klik "Soal Berikutnya"            |
            |  8. Kembali ke langkah 1 (soal baru)       |
            +-------------------------------------------+
                                 |
                        [Klik "Ganti Topik"]
                                 |
                                 v
                        +------------------+
                        |  TOPIK PAGE       |
                        +------------------+
```

### Detail Halaman

#### HomeView
- Daftar subject dalam bentuk card
- Masing-masing card: icon/logo + nama subject
- Klik -> navigasi ke TopicView dengan subject_id

#### TopicView
- Header: nama subject, tombol "Kembali"
- Daftar topic dalam bentuk list/card
- Masing-masing: nama topic + jumlah soal?
- Klik -> navigasi ke QuizView dengan topic_id

#### QuizView
- **Header**: nama topic, tombol "Ganti Topik"
- **TimerBar**: display waktu chrono (MM:SS) sejak soal tampil
- **QuestionCard**:
  - Indikator tipe soal (Pilihan Ganda / Pilihan Ganda Kompleks / Benar-Salah)
  - Label tingkat kesulitan
  - Teks soal
- **OptionList**:
  - `single_choice`: radio button (satu pilihan)
  - `multiple_response`: checkbox (bisa >1)
  - `true_false`: radio button (Benar / Salah)
- **Tombol "Selesai"**: disabled sampai ada opsi terpilih
- **Setelah submit**:
  - Opsi terkunci (disabled)
  - Opsi benar di-highlight hijau, opsi salah (jika user milih salah) di-highlight merah
  - **ExplanationPanel** muncul:
    - Status: "Benar!" / "Salah"
    - Waktu tempuh: "00:45"
    - Pembahasan teks
  - Tombol "Soal Berikutnya" muncul

---

## 7. Format Data Seed (seed.json)

Digunakan untuk injeksi awal data soal ke database.
File diletakkan di root project, dieksekusi via perintah `bun run seed`.

```json
{
  "subjects": [
    { "slug": "tps", "label": "TPS", "display_order": 1 },
    { "slug": "literasi-bahasa-indonesia", "label": "Literasi Bahasa Indonesia", "display_order": 2 },
    { "slug": "literasi-bahasa-inggris", "label": "Literasi Bahasa Inggris", "display_order": 3 },
    { "slug": "penalaran-matematika", "label": "Penalaran Matematika", "display_order": 4 }
  ],
  "topics": [
    { "slug": "penalaran-umum", "subject_slug": "tps", "label": "Penalaran Umum", "display_order": 1 },
    { "slug": "pengetahuan-kuantitatif", "subject_slug": "tps", "label": "Pengetahuan Kuantitatif", "display_order": 2 },
    { "slug": "pemahaman-dan-pengetahuan-bacaan", "subject_slug": "literasi-bahasa-indonesia", "label": "Pemahaman dan Pengetahuan Bacaan", "display_order": 1 },
    { "slug": "literasi-bahasa-inggris", "subject_slug": "literasi-bahasa-inggris", "label": "Literasi Bahasa Inggris", "display_order": 1 },
    { "slug": "aljabar", "subject_slug": "penalaran-matematika", "label": "Aljabar", "display_order": 1 },
    { "slug": "geometri", "subject_slug": "penalaran-matematika", "label": "Geometri", "display_order": 2 }
  ],
  "questions": [
    {
      "topic_slug": "penalaran-umum",
      "type": "single_choice",
      "difficulty": "medium",
      "question_text": "...",
      "explanation_text": "...",
      "options": [
        { "key": "A", "text": "...", "is_correct": false },
        { "key": "B", "text": "...", "is_correct": true },
        { "key": "C", "text": "...", "is_correct": false },
        { "key": "D", "text": "...", "is_correct": false }
      ]
    }
  ]
}
```

**Aturan:**
- `subject_slug` pada topic harus merujuk ke slug subject yang ada
- `topic_slug` pada question harus merujuk ke slug topic yang ada
- `single_choice`: tepat 1 option dengan is_correct=true
- `multiple_response`: minimal 2 option dengan is_correct=true
- `true_false`: tepat 2 option (key: "true", "false"), salah satu is_correct=true

---

## 8. Environment (.env)

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rahaSi4Hasan
DB_NAME=utbk_belajar
APP_PORT=3000
```

Cukup minimal. Backend membaca variabel ini untuk koneksi database dan port server.

---

## 9. Testing Strategy

### Backend
| Test | Deskripsi |
|---|---|
| `scoring.test.ts` | Unit test koreksi single_choice, multiple_response, true_false |
| `subjects.test.ts` | Test GET /api/subjects |
| `topics.test.ts` | Test GET /api/topics?subject_id= |
| `questions.test.ts` | Test GET /api/questions/random, POST /api/questions/:id/check |

### Frontend
| Test | Deskripsi |
|---|---|
| `TimerBar.test.ts` | Start/stop timer, display format |
| `OptionList.test.ts` | Single select, multi select, true/false toggle |
| `ExplanationPanel.test.ts` | Render benar/salah, pembahasan |
| `HomeView.test.ts` | Render daftar subject |
| `TopicView.test.ts` | Render daftar topic, klik item |
| `QuizView.test.ts` | Flow lengkap (ambil soal -> jawab -> submit -> lihat pembahasan -> lanjut) |

---

## 10. Prinsip Desain

1. **Kesederhanaan** - Tidak ada fitur yang tidak diperlukan. Fokus pada latihan soal.
2. **Tanpa auth** - Single-user, aplikasi lokal.
3. **Tanpa state server** - Semua state sesi belajar di frontend.
4. **Tanpa riwayat** - Tidak ada penyimpanan hasil. Soal habis dibahas, selesai.
5. **Seed-first** - Data masuk via seed JSON. Tidak perlu UI admin dulu.
6. **Timer per soal** - Waktu dihitung per soal dari tampil sampai submit.
