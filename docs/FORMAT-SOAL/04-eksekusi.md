# Eksekusi

Dari root project:

```bash
bun run seed:check   # validasi dulu
bun run seed         # baru eksekusi
```

## seed:check

Memvalidasi struktur JSON dan aturan domain soal tanpa menyentuh database.

## seed

Memasukkan data ke database. Output contoh:

```
[seed] Done. Subjects: 0, Topics: 1, Questions: 5
```

- `Subjects: 0` — tidak ada subject baru (hanya insert jika belum ada)
- `Questions: 5` — 5 soal baru berhasil ditambahkan

Perilaku penting:
- Subject/topic yang sudah ada (by `slug`) tidak di-insert ulang
- Soal yang sudah ada (by `question_text` identik) tidak di-insert ulang

## Validasi Format

```bash
bun run seed:check
```

Fallback (cek JSON mentah):

```bash
python3 -m json.tool seed.json > /dev/null && echo "Valid" || echo "ERROR JSON"
```

Error biasa: koma berlebih, kutip tidak ditutup, bracket tidak seimbang.
