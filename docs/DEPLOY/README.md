# Panduan Deploy Docker

Panduan deploy produksi menggunakan Docker dengan Nginx Proxy Manager.
Frontend dan backend dalam satu service, satu domain.

---

## Strategi

```
Internet
   |
   v
Nginx Proxy Manager
   |
   v
App container (Bun + Hono)
   ├── /           -> frontend dist
   ├── /auth       -> frontend route (SPA)
   ├── /topics/... -> frontend route (SPA)
   └── /api/*      -> backend API
```

- Frontend dan backend datang dari service yang sama
- API tetap di path `/api`
- Browser panggil `/api` relatif ke domain yang sama
- Tidak perlu dua domain atau CORS ribet

## Prasyarat

- Docker dan Docker Compose terpasang di VPS
- Database MySQL/MariaDB sudah berjalan di host
- Database `utbk_belajar` sudah dibuat

## Struktur Folder

```
docs/DEPLOY/
├── README.md              ← file ini
├── 01-setup.md            ← clone, install, build, env
├── 02-database.md         ← database setup
├── 03-network.md          ← Docker network + topologi NPM
├── 04-configuration.md    ← jalankan container, konfigurasi NPM, SSL
├── 05-verification.md     ← health check, auth test, migrasi & seed
├── 06-checklist.md        ← checklist operasional & produksi
├── 07-update.md           ← update kode
└── 08-troubleshooting.md  ← masalah umum
```
