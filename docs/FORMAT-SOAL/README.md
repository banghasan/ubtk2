# Panduan Memasukkan Soal

Soal dimasukkan melalui file `seed.json` di root project.

Workflow resminya:

```bash
bun run seed:check   # validasi dulu
bun run seed         # baru eksekusi
```

Penting:
- `seed` paling aman dipakai untuk **menambah data baru**
- `seed` **bukan** mekanisme untuk edit/hapus data yang sudah pernah masuk ke database
- Jangan berasumsi bahwa mengubah `seed.json` otomatis mengubah data lama

## Struktur File

```
docs/FORMAT-SOAL/
├── README.md                ← file ini
├── 01-struktur-data.md      ← format subjects, topics, questions
├── 02-tipe-soal.md          ← contoh single_choice, multiple_response, true_false
├── 03-operasi-data.md       ← tambah, edit, rename, hapus
├── 04-eksekusi.md           ← menjalankan seed, validasi
├── 05-ai-prompt.md          ← tips generate soal dengan AI
└── 06-troubleshooting.md    ← kesalahan umum + solusi
```
