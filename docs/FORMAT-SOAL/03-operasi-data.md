# Operasi Data

| Operasi | Aman lewat `seed.json`? | Catatan |
|---|---|---|
| Tambah subject baru | Ya | Jalankan `seed:check` lalu `seed` |
| Tambah topic baru | Ya | Pastikan `subject_slug` valid |
| Tambah soal baru | Ya | Pastikan `question_text` belum dipakai |
| Edit label subject/topic | Tidak dijamin | Implementasi tidak update row lama |
| Edit isi soal/pembahasan/opsi | Tidak dijamin | Soal lama bisa tetap tidak berubah |
| Rename `slug` subject/topic | Tidak | Bisa membuat entitas baru |
| Hapus dari `seed.json` | Tidak | Data lama tidak otomatis terhapus |

## Menambah Data

```bash
bun run seed:check
bun run seed
```

## Mengedit Data Existing

Anggap `seed.json` sebagai sumber **tambah** data, bukan editor data lama.

Praktik aman:
1. Backup database
2. Tentukan apakah perubahan itu tambah baru atau edit lama
3. Jika edit lama, lakukan cleanup manual atau SQL terkontrol
4. Jalankan `bun run seed:check` setelah perubahan

## Rename Slug

Jangan langsung edit `slug` lalu jalankan `seed`.

Risiko:
- Entitas baru dibuat
- Relasi lama tetap tertinggal
- Data jadi ganda atau terfragmentasi

## Menghapus Data

Hapus item dari `seed.json` tidak otomatis menghapus database.
Lakukan delete manual atau siapkan migrasi/cleanup khusus.
