[WARNING] frontend/src/composables/useQuizSession.ts:88-95 — `startQuiz()` masih menggantungkan mulai sesi pada `questionCount`. Jika `/api/questions/count` gagal tetapi `loadQuestion()` sudah berhasil mengambil soal, user bisa terjebak di layar siap tanpa pernah masuk ke state `answering`. — Gunakan `question.value` sebagai syarat utama memulai quiz; `questionCount` cukup dipakai untuk tampilan/progress.

[WARNING] backend/src/routes/auth.ts:21-25 — Parsing body JSON pada login masih tanpa `try/catch`. Request dengan JSON rusak akan dilempar ke error handler global dan menjadi `500`, padahal kontrak aplikasi mengharuskan `400 invalid_body`. — Tangani error parsing body secara lokal sebelum validasi Zod.

[WARNING] backend/src/routes/questions.ts:66-70 — Endpoint `POST /api/questions/:id/check` punya masalah yang sama: malformed JSON akan menghasilkan `500`, bukan `400`. — Bungkus `c.req.json()` dengan penanganan error lokal dan kembalikan response `invalid_body`.

[SUGGESTION] frontend/src/__tests__/composables/useQuizSession.test.ts; backend/src/__tests__/routes/questions.test.ts — Test suite hijau, tetapi dua edge case penting belum dikunci: `count` gagal tetapi random sukses, dan malformed JSON pada auth/check. — Tambahkan regression test untuk dua kasus itu agar refactor berikutnya tidak membuka bug yang sama.

[SUGGESTION] backend/src/lib/seed.ts:128-177; docs/FORMAT-SOAL.md:1 — Dokumentasi sudah jauh lebih jujur soal perilaku seed, tetapi implementasi tetap insert-only untuk subject/topic/question. Ini masih menjadi batasan operasional terbesar repo untuk maintenance bank soal. — Jika maintenance data existing memang kebutuhan nyata, lanjutkan ke desain sinkronisasi update terkontrol berbasis identifier stabil pada soal.
