# Contributing

Dokumen ini menjelaskan workflow kerja lokal untuk repo `utbk2`.
Gunakan ini bersama [RULES.md](/home/DATA/Proyek/AHE/utbk2/RULES.md:1).

---

## Prinsip Dasar

- Jangan ubah stack utama tanpa diskusi
- Jangan tambah fitur di luar scope produk
- Jangan commit `.env`, `node_modules`, atau file build
- Selalu sinkron dengan aturan di `RULES.md`

---

## Setup Lokal

```bash
bun install
bun run install:all
bun run db:migrate
bun run seed
```

Jalankan aplikasi:

```bash
bun run dev
```

---

## Workflow Harian

Untuk perubahan biasa:

```bash
bun run seed:check
bun run lint
bun run test
bun run typecheck
```

Jika Anda mengubah `seed.json`:

```bash
bun run seed:check
bun run seed
```

Jika Anda mengubah style/format:

```bash
bun run format
```

---

## Checklist Sebelum Selesai

Sebuah perubahan dianggap siap jika:

- `bun run seed:check` lulus bila `seed.json` ikut berubah
- `bun run lint` lulus
- `bun run test` lulus
- `bun run typecheck` lulus
- dokumentasi diperbarui bila workflow, endpoint, atau struktur berubah

---

## Area Penting

Perubahan backend:

- validasi request di `backend/src/validators/`
- query/data access di `backend/src/services/`
- route handler di `backend/src/routes/`
- response shaping di `backend/src/mappers/`

Perubahan frontend:

- API client di `frontend/src/api/`
- state quiz utama di `frontend/src/composables/useQuizSession.ts`
- presentasi view di `frontend/src/views/`
- komponen reusable di `frontend/src/components/`

---

## Jika Menambah Fitur

Sebelum menambah fitur:

1. cek apakah fitur masih sesuai scope produk
2. update test yang relevan
3. update dokumentasi jika kontrak berubah

Jika ragu, baca kembali:

- [RULES.md](/home/DATA/Proyek/AHE/utbk2/RULES.md:1)
- [README.md](/home/DATA/Proyek/AHE/utbk2/README.md:1)
- [docs/RENCANA-PROFESIONALISASI.md](/home/DATA/Proyek/AHE/utbk2/docs/RENCANA-PROFESIONALISASI.md:1)
