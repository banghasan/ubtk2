# Checklist

## Checklist Operasional dari Nol

1. arahkan DNS domain ke IP VPS
2. install Docker + Docker Compose
3. siapkan database MySQL/MariaDB
4. clone repo
5. `bun install` + `bun run install:all`
6. build frontend
7. isi file `.env`
8. `bun run seed:check`
9. buat `npm_network`
10. jalankan NPM
11. jalankan app
12. migrasi + seed
13. buat Proxy Host di NPM ke `app:3000`
14. aktifkan SSL
15. cek `https://domain-anda.com/health`
16. cek `https://domain-anda.com/api/auth`
17. buka domain di browser

## Checklist Produksi Satu Domain

- [ ] `frontend/dist/` ada (hasil build)
- [ ] `bun run seed:check` lulus
- [ ] migrasi database sudah dijalankan
- [ ] seed sudah dijalankan
- [ ] `https://domain-anda.com/health` → `{"status":"ok"}`
- [ ] `https://domain-anda.com/api/auth` bisa diakses
- [ ] frontend di domain utama bisa panggil `/api/*` tanpa domain kedua
