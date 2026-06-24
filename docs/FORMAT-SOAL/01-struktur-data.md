# Struktur Data

File `seed.json` memiliki tiga bagian wajib:

```json
{
  "subjects": [ ... ],
  "topics": [ ... ],
  "questions": [ ... ]
}
```

---

## Subjects — Mata Uji

```json
{
  "slug": "tps",
  "label": "TPS",
  "display_order": 1
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `slug` | string | Ya | ID unik. Huruf kecil + strip. Tidak boleh duplikat. |
| `label` | string | Ya | Nama tampilan. |
| `display_order` | number | Ya | Urutan tampil. `1` = paling atas. |

Subject bawaan:

```json
{ "slug": "tps",                            "label": "TPS",                         "display_order": 1 },
{ "slug": "literasi-bahasa-indonesia",      "label": "Literasi Bahasa Indonesia",   "display_order": 2 },
{ "slug": "literasi-bahasa-inggris",        "label": "Literasi Bahasa Inggris",     "display_order": 3 },
{ "slug": "penalaran-matematika",           "label": "Penalaran Matematika",        "display_order": 4 }
```

**Aturan:**
- `slug` harus dianggap tetap setelah data di-seed
- Mengganti `slug` bukan rename, berpotensi membuat subject baru
- Subject dihapus dari `seed.json` tidak otomatis terhapus dari database

---

## Topics — Topik

```json
{
  "slug": "penalaran-umum",
  "subject_slug": "tps",
  "label": "Penalaran Umum",
  "display_order": 1
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `slug` | string | Ya | ID unik global. Huruf kecil + strip. |
| `subject_slug` | string | Ya | Merujuk ke `slug` subject yang ada. |
| `label` | string | Ya | Nama tampilan. |
| `display_order` | number | Ya | Urutan tampil dalam subject. |

Contoh:

```json
{ "slug": "geometri", "subject_slug": "penalaran-matematika", "label": "Geometri", "display_order": 2 }
```

**Aturan:** sama dengan subject — `slug` tetap setelah data masuk, rename atau hapus tidak otomatis.

---

## Questions — Soal

### Struktur

```json
{
  "topic_slug": "penalaran-umum",
  "type": "single_choice",
  "difficulty": "medium",
  "question_text": "Isi soal...",
  "explanation_text": "Pembahasan...",
  "options": [ ... ]
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `topic_slug` | string | Ya | Merujuk ke `slug` topic. |
| `type` | string | Ya | `single_choice` / `multiple_response` / `true_false` |
| `difficulty` | string | Ya | `easy` / `medium` / `hard` |
| `question_text` | string | Ya | Isi soal. Bisa multi-baris. |
| `explanation_text` | string | Ya | Pembahasan. Wajib diisi walau singkat. |
| `options` | array | Ya | Array opsi jawaban. |

**Catatan dedup:** deteksi duplikasi berbasis `question_text`. Soal dengan teks identik (topik beda pun) dianggap sama dan tidak akan di-insert ulang.

### Options — Opsi Jawaban

```json
{ "key": "A", "text": "Pilihan A", "is_correct": false }
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `key` | string | Ya | `A`, `B`, `C`, `D`. Untuk `true_false`: `true` / `false` |
| `text` | string | Ya | Teks opsi. |
| `is_correct` | boolean | Ya | `true` jika ini kunci jawaban. |
