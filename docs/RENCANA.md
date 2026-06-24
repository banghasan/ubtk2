# RENCANA EKSEKUSI: UTBK Belajar

> Dokumen ini berisi tahapan pengerjaan secara detail dan berurutan.
> Setiap tahap harus selesai (build/test lulus) sebelum lanjut.

---

## Fase 1: Backend Foundation

### 1.1 Inisialisasi Project Backend
- Buat folder `backend/`
- `bun init` atau manual setup `package.json`
- Install dependencies: `hono`, `mysql2`, `drizzle-orm`, `zod`
- Install dev dependencies: `typescript`, `vitest`, `drizzle-kit`, `@types/bun`
- Setup `tsconfig.json` (strict mode, path alias)
- Setup `vitest.config.ts`

### 1.2 Konfigurasi Database
- Buat `backend/src/db/connection.ts`:
  - Baca env variable
  - Buat MySQL connection pool menggunakan `mysql2/promise`
  - Export pool dan helper query
- Buat file `.env` di root project (jangan di-commit, tapi buat `.env.example`)
- Setup `drizzle.config.ts` untuk migrasi

### 1.3 Drizzle Schema
- Buat `backend/src/db/schema/subjects.ts`
- Buat `backend/src/db/schema/topics.ts`
- Buat `backend/src/db/schema/questions.ts`
- Buat `backend/src/db/schema/question-options.ts`
- Buat `backend/src/db/schema/index.ts` (re-export semua)
- Generate migrasi via `drizzle-kit generate`
- Jalankan migrasi via `drizzle-kit migrate` atau migration runner

### 1.4 Hono App Factory
- Buat `backend/src/app.ts`:
  - Inisialisasi Hono app
  - CORS middleware (allow frontend origin)
  - JSON error handler
  - Mount routes
- Buat `backend/src/index.ts`:
  - Baca env
  - Inisialisasi pool
  - Jalankan migrasi
  - Jalankan Bun.serve

### 1.5 API Routes: Subjects & Topics
- Buat `backend/src/routes/subjects.ts`:
  - `GET /api/subjects` -> SELECT semua subject ORDER BY display_order
- Buat `backend/src/routes/topics.ts`:
  - `GET /api/topics` -> SELECT topic WHERE subject_id = ?
- Unit test dengan Vitest + Hono testing

### 1.6 API Routes: Questions
- Buat `backend/src/routes/questions.ts`:
  - `GET /api/questions/random?topic_id=` -> SELECT 1 soal acak dengan opsi (tanpa is_correct)
  - `POST /api/questions/:id/check` -> validasi jawaban, return correct/incorrect + pembahasan
- Buat `backend/src/lib/scoring.ts`:
  - `checkAnswer(type, selectedKeys, correctKeys): CheckResult`
  - Handle single_choice, multiple_response, true_false
- Unit test dengan Vitest + Hono testing

### 1.7 Seed Data System
- Buat `backend/src/lib/seed.ts`:
  - Baca `seed.json` dari root project
  - Validasi format (subjects, topics, questions + options)
  - Insert/update ke database secara transaksional
  - Output log jumlah data yang dimasukkan
- Tambahkan script `"seed"` di package.json
- Buat `seed.json` di root project dengan 10-20 contoh soal untuk setiap topik

**Delivery Fase 1:** Backend bisa dijalankan, API bisa diakses via curl/Postman, test lulus.

---

## Fase 2: Frontend Foundation

### 2.1 Inisialisasi Project Frontend
- `bun create vite frontend --template vue-ts` atau manual
- Install dependencies: `vue-router`
- Install dev dependencies: `vitest`, `@vue/test-utils`, `jsdom`, `@testing-library/vue`
- Setup `vite.config.ts` (proxy `/api` ke backend)
- Setup `vitest.config.ts` (environment: jsdom)
- Setup `tsconfig.json`

### 2.2 API Client
- Buat `frontend/src/api/client.ts`:
  - `fetchSubjects(): Promise<Subject[]>`
  - `fetchTopics(subjectId): Promise<Topic[]>`
  - `fetchRandomQuestion(topicId): Promise<Question | null>`
  - `checkAnswer(questionId, selectedKeys): Promise<CheckResult>`

### 2.3 Router
- Buat `frontend/src/router/index.ts`:
  - `/` -> HomeView
  - `/topics/:subjectId` -> TopicView
  - `/quiz/:topicId` -> QuizView

### 2.4 Views
- Buat `HomeView.vue`:
  - Fetch subjects via API
  - Tampilkan dalam card grid
  - Klik -> navigasi ke `/topics/:id`
- Buat `TopicView.vue`:
  - Fetch topics via API berdasarkan subjectId dari params
  - Tampilkan daftar topic
  - Klik -> navigasi ke `/quiz/:topicId`

### 2.5 Komponen Quiz
- Buat `TimerBar.vue`:
  - Props: `running: boolean`
  - Emit: `@tick` (waktu berubah)
  - Display: MM:SS format
  - Start timing saat mount
  - Stop saat parent set running=false
- Buat `QuestionCard.vue`:
  - Props: `question: Question`
  - Render teks soal
  - Tampilkan tipe & difficulty badge
- Buat `OptionList.vue`:
  - Props: `options: Option[]`, `type: QuestionType`, `disabled: boolean`
  - V-model: `selectedKeys: string[]`
  - Render radio (single_choice/true_false) atau checkbox (multiple_response)
- Buat `ExplanationPanel.vue`:
  - Props: `result: CheckResult`
  - Tampilkan status benar/salah, waktu tempuh, kunci jawaban, pembahasan

### 2.6 QuizView (Integrasi)
- Buat `QuizView.vue`:
  - State machine: `loading -> answering -> reviewing`
  - `loading`: fetch soal dari API, tampilkan skeleton/loading
  - `answering`: tampilkan QuestionCard + OptionList + TimerBar + tombol "Selesai"
  - `reviewing`: tampilkan hasil + ExplanationPanel + tombol "Soal Berikutnya"
  - Handle error (soal null, network error)
  - Tombol "Ganti Topik" di header

### 2.7 Styling
- Gunakan CSS atau utility CSS ringan
- Tema sederhana, fokus pada keterbacaan soal
- Responsive untuk mobile & desktop

**Delivery Fase 2:** Frontend bisa diakses di browser, flow lengkap berfungsi.

---

## Fase 3: Testing & Finishing

### 3.1 Backend Tests
- Pastikan coverage:
  - `lib/scoring.test.ts` - semua tipe soal + edge cases
  - `routes/subjects.test.ts` - sukses, empty
  - `routes/topics.test.ts` - sukses, invalid subject_id
  - `routes/questions.test.ts` - random, check benar/salah, invalid id
- Semua test passing

### 3.2 Frontend Tests
- Pastikan coverage:
  - `TimerBar.test.ts` - format display, stop/start
  - `OptionList.test.ts` - single select, multi select, disabled state
  - `ExplanationPanel.test.ts` - benar, salah, render pembahasan
  - `QuizView.test.ts` - loading -> answering -> reviewing cycle
- Semua test passing

### 3.3 Seed Data
- Isi `seed.json` dengan 10+ soal per topic
- Setiap tipe soal (single_choice, multiple_response, true_false) terwakili
- Variasi difficulty (easy, medium, hard)

### 3.4 Integrasi & Manual QA
- Jalankan backend + frontend bersamaan
- Test flow lengkap dari home sampai pembahasan
- Test semua tipe soal
- Test timer behavior
- Test responsive layout
- Catat issue dan fix

---

## Ringkasan Timeline

| Fase | Item | Estimasi |
|---|---|---|
| Fase 1 | Backend foundation + API | |
| 1.1 | Inisialisasi project | - |
| 1.2 | Konfigurasi database | - |
| 1.3 | Drizzle schema + migrasi | - |
| 1.4 | Hono app | - |
| 1.5 | Routes subjects & topics | - |
| 1.6 | Routes questions + scoring | - |
| 1.7 | Seed data system | - |
| **Fase 2** | **Frontend** | |
| 2.1 | Inisialisasi project | - |
| 2.2 | API client | - |
| 2.3 | Router | - |
| 2.4 | Views (Home, Topic) | - |
| 2.5 | Komponen quiz (Timer, Question, Options, Explanation) | - |
| 2.6 | QuizView integrasi | - |
| 2.7 | Styling | - |
| **Fase 3** | **Testing & finishing** | |
| 3.1 | Backend tests | - |
| 3.2 | Frontend tests | - |
| 3.3 | Seed data | - |
| 3.4 | Manual QA | - |
