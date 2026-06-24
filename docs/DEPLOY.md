# Panduan Deploy Docker

Panduan ini memakai jalur deploy utama yang sederhana:

1. build frontend
2. siapkan backend + env
3. validasi seed
4. jalankan container
5. migrasi, seed, dan health check

Prasyarat:

- Docker dan Docker Compose sudah terpasang
- Database MySQL/MariaDB sudah berjalan di host/VPS
- Database `utbk_belajar` sudah dibuat atau bisa dibuat

---

## 1. Clone Project

```bash
git clone <url-repo> utbk2
cd utbk2
```

---

## 2. Install Dependency

Install dependency root untuk tooling, lalu package backend/frontend:

```bash
bun install
bun run install:all
```

---

## 3. Build Frontend

```bash
cd frontend
bun run build
cd ..
```

Hasil build akan masuk ke `frontend/dist/`.

---

## 4. Setup Environment

```bash
cp .env.production.example .env
nano .env
```

Contoh isi:

```env
DB_HOST=172.17.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password-mysql-anda
DB_NAME=utbk_belajar
APP_PORT=3000
FRONTEND_PORT=5173
APP_PASSWORD=password-untuk-akses-aplikasi
```

Catatan:

- `APP_PASSWORD` boleh dikosongkan jika ingin auth nonaktif
- `172.17.0.1` adalah Docker bridge gateway yang umum di Linux
- Jika tidak cocok, coba `host.docker.internal` atau jalankan container dengan `network_mode: host`

---

## 5. Pastikan Database Bisa Diakses

MySQL harus menerima koneksi TCP.

```bash
ss -tlnp | grep 3306
mysql -h 127.0.0.1 -u root -p
```

Jika database belum ada:

```bash
mysql -h 127.0.0.1 -u root -p -e "CREATE DATABASE IF NOT EXISTS utbk_belajar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

## 6. Validasi Seed Sebelum Deploy

Sebelum container dijalankan, validasi dulu `seed.json`:

```bash
bun run seed:check
```

Jika command ini gagal, perbaiki `seed.json` dulu sebelum lanjut.

---

## 7. Jalankan Container

```bash
docker compose up -d
```

Ringkasannya:

- container memakai image `oven/bun`
- frontend build di-mount dari `frontend/dist`
- backend source di-mount dari `backend/`
- app dijalankan dari `/app/backend`

---

## 8. Jalankan Migrasi dan Seed

```bash
docker compose exec app bun src/db/migrate.ts
docker compose exec app bun src/lib/seed.ts
```

Jika Anda mengubah `seed.json` di server:

```bash
bun run seed:check
docker compose exec app bun src/lib/seed.ts
```

---

## 9. Verifikasi Deploy

### Cek dasar

```bash
docker compose ps
docker compose logs -f
curl http://localhost:3000/health
```

Response yang benar:

```json
{ "status": "ok" }
```

### Cek auth mode

Cek status auth:

```bash
curl http://localhost:3000/api/auth
```

Jika `auth_enabled` bernilai `false`, aplikasi bisa diakses langsung.

Jika `auth_enabled` bernilai `true`, ambil token dulu:

```bash
curl -s http://localhost:3000/api/auth \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"password":"PASSWORD_APP_ANDA"}'
```

Lalu pakai token itu untuk test endpoint:

```bash
curl http://localhost:3000/api/subjects -H "x-auth-token: TOKEN_ANDA"
```

Jika auth nonaktif:

```bash
curl http://localhost:3000/api/subjects
```

---

## 10. Update Kode

Saat ada update:

```bash
git pull
bun install
bun run install:all
cd frontend && bun run build && cd ..
bun run seed:check
docker compose restart
docker compose exec app bun src/db/migrate.ts
docker compose exec app bun src/lib/seed.ts
```

Setelah update, cek lagi:

```bash
curl http://localhost:3000/health
docker compose logs --tail=100
```

---

## Troubleshooting

### Container tidak bisa konek ke MySQL

Error:

```text
connect ECONNREFUSED 172.17.0.1:3306
```

Kemungkinan:

1. MySQL hanya bind ke `127.0.0.1`
2. Firewall memblokir port 3306

Cek:

```bash
sudo grep bind-address /etc/mysql/mariadb.conf.d/50-server.cnf
```

Jika perlu, ubah bind address dan restart MySQL:

```bash
sudo systemctl restart mariadb
```

### User MySQL tidak bisa login via TCP

```bash
sudo mysql -u root
```

Lalu beri akses yang sesuai:

```sql
CREATE USER IF NOT EXISTS 'root'@'172.17.0.%' IDENTIFIED BY 'PASSWORD';
CREATE USER IF NOT EXISTS 'root'@'127.0.0.1' IDENTIFIED BY 'PASSWORD';
FLUSH PRIVILEGES;
```

### Alternatif: `network_mode: host`

Jika jalur bridge Docker tidak cocok, Anda bisa pakai host networking.

Contoh:

```yaml
services:
  app:
    image: oven/bun:1.3.14
    restart: unless-stopped
    network_mode: host
    volumes:
      - ./frontend/dist:/app/frontend/dist
      - ./backend:/app/backend
      - ./seed.json:/app/seed.json
    working_dir: /app/backend
    command: ["bun", "src/index.ts"]
    environment:
      DB_HOST: 127.0.0.1
      DB_PORT: "3306"
      DB_USER: root
      DB_PASSWORD: ${DB_PASSWORD:-}
      DB_NAME: utbk_belajar
      APP_PORT: "3000"
      FRONTEND_PORT: "5173"
      APP_PASSWORD: ${APP_PASSWORD:-}
      NODE_ENV: production
```

Dengan `network_mode: host`:

- app bisa akses `127.0.0.1:3306` langsung
- app juga berjalan di `localhost:3000` tanpa port mapping

Jika aplikasi ingin dibuka publik, pasang reverse proxy seperti Caddy atau Nginx di host.
