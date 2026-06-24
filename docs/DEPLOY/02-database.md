# Database

## Cek Koneksi MySQL

MySQL harus menerima koneksi TCP:

```bash
ss -tlnp | grep 3306
mysql -h 127.0.0.1 -u root -p
```

## Buat Database (jika belum ada)

```bash
mysql -h 127.0.0.1 -u root -p -e \
  "CREATE DATABASE IF NOT EXISTS utbk_belajar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## Validasi Seed Sebelum Deploy

Sebelum container dijalankan, validasi `seed.json`:

```bash
bun run seed:check
```

Jika gagal, perbaiki `seed.json` dulu sebelum lanjut.
