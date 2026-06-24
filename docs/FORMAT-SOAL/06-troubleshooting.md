# Kesalahan Umum

| Masalah | Penyebab | Solusi |
|---|---|---|
| `[seed] Subject "x" not found` | `subject_slug` di topic tidak cocok | Pastikan slug subject ada di `subjects` |
| `[seed] Topic "y" not found` | `topic_slug` di question tidak cocok | Pastikan slug topic ada di `topics` |
| Soal tidak muncul | `explanation_text` kosong | Wajib diisi |
| `true_false` tidak muncul opsi | Opsi bukan `true`/`false` | Gunakan `"key": "true"` dan `"key": "false"` |
| Perubahan label tidak muncul | `seed` tidak meng-update row lama | Edit existing, bukan tambah data |
| Ganti `slug` lalu data jadi ganda | Rename slug membuat entitas baru | Jangan rename slug lewat edit biasa |
| Hapus item dari `seed.json` tapi data masih ada | `seed` tidak melakukan delete | Cleanup manual/migrasi khusus |
| Soal baru tidak masuk padahal topic beda | `question_text` sama dengan soal lain | Pastikan teks soal benar-benar unik |
