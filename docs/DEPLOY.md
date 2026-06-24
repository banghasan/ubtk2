# Panduan Deploy Docker

Panduan ini fokus pada fase produksi dengan strategi berikut:

1. aplikasi dilayani dalam **satu domain**
2. frontend dan backend datang dari service yang sama
3. endpoint API tetap berada di path `/api`
4. reverse proxy memakai **Nginx Proxy Manager (NPM)**

Dengan strategi ini:

- user membuka `https://domain-anda.com`
- halaman frontend dilayani oleh backend production
- request API otomatis menuju `https://domain-anda.com/api/...`
- tidak perlu domain frontend dan backend terpisah

Ini cocok dengan implementasi repo saat ini karena:

- frontend client sudah memakai base path relatif `/api`
- backend production sudah melayani file build frontend dan route `/api/*`

Prasyarat:

- Docker dan Docker Compose sudah terpasang
- Database MySQL/MariaDB sudah berjalan di host/VPS
- Database `utbk_belajar` sudah dibuat atau bisa dibuat

---

## Strategi Produksi

Strategi yang direkomendasikan:

```text
Internet
   |
   v
Nginx Proxy Manager
   |
   v
App container (Bun + Hono)
   ├── /           -> frontend dist
   ├── /auth       -> frontend route
   ├── /topics/... -> frontend route
   └── /api/*      -> backend API
```

Artinya NPM tidak perlu memisahkan frontend dan backend.
NPM cukup meneruskan **semua trafik domain** ke satu target app.

Contoh:

- `https://domain-anda.com/`
- `https://domain-anda.com/auth`
- `https://domain-anda.com/api/subjects`

Semua masuk ke service aplikasi yang sama.

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
CORS_ORIGIN=https://domain-anda.com
```

Catatan:

- `APP_PASSWORD` boleh dikosongkan jika ingin auth nonaktif
- `CORS_ORIGIN` untuk produksi sebaiknya diisi domain publik final
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

## 7. Pilih Topologi NPM

Ada dua skenario umum.

### Opsi A — NPM berjalan di host

Jika NPM berjalan langsung di host VPS dan meneruskan ke `127.0.0.1:3000`, konfigurasi `docker-compose.yml` saat ini sudah cocok:

```yaml
ports:
  - "127.0.0.1:3000:3000"
```

Dalam skenario ini:

- app hanya terbuka di loopback VPS
- NPM meneruskan trafik domain ke `http://127.0.0.1:3000`
- ini aman dan sederhana

### Opsi B — NPM berjalan sebagai container Docker

Ini skenario yang paling umum untuk Nginx Proxy Manager.

Jika NPM berjalan sebagai container terpisah, konfigurasi app **tidak boleh hanya bind ke `127.0.0.1`**, karena container NPM tidak bisa menjangkau loopback app seperti host process.

Untuk skenario ini, strategi yang direkomendasikan:

1. letakkan app dan NPM pada docker network yang sama
2. biarkan NPM meneruskan trafik ke hostname service app, misalnya `app:3000`
3. hindari mengekspos port app ke publik jika tidak diperlukan

Contoh penyesuaian compose untuk app:

```yaml
services:
  app:
    image: oven/bun:1.3.14
    restart: unless-stopped
    expose:
      - "3000"
    volumes:
      - ./frontend/dist:/app/frontend/dist
      - ./backend:/app/backend
      - ./seed.json:/app/seed.json
    working_dir: /app/backend
    command: ["bun", "src/index.ts"]
    environment:
      DB_HOST: ${DB_HOST:-172.17.0.1}
      DB_PORT: "3306"
      DB_USER: ${DB_USER:-root}
      DB_PASSWORD: ${DB_PASSWORD:-}
      DB_NAME: ${DB_NAME:-utbk_belajar}
      APP_PORT: "3000"
      APP_PASSWORD: ${APP_PASSWORD:-}
      CORS_ORIGIN: ${CORS_ORIGIN:-https://domain-anda.com}
      NODE_ENV: production
```

Lalu pastikan app dan NPM berada di network yang sama.

Jika Anda memakai external network, contohnya:

```bash
docker network create npm_network
```

Lalu join service app ke network itu.

### Contoh final `docker-compose.yml` untuk app

Jika NPM berjalan sebagai container terpisah dan Anda ingin app ini menjadi upstream `app:3000`, contoh final yang direkomendasikan:

```yaml
services:
  app:
    image: oven/bun:1.3.14
    restart: unless-stopped
    expose:
      - "3000"
    volumes:
      - ./frontend/dist:/app/frontend/dist
      - ./backend:/app/backend
      - ./seed.json:/app/seed.json
    working_dir: /app/backend
    command: ["bun", "src/index.ts"]
    environment:
      DB_HOST: ${DB_HOST:-172.17.0.1}
      DB_PORT: "3306"
      DB_USER: ${DB_USER:-root}
      DB_PASSWORD: ${DB_PASSWORD:-}
      DB_NAME: ${DB_NAME:-utbk_belajar}
      APP_PORT: "3000"
      APP_PASSWORD: ${APP_PASSWORD:-}
      CORS_ORIGIN: ${CORS_ORIGIN:-https://domain-anda.com}
      NODE_ENV: production
    networks:
      - npm_network

networks:
  npm_network:
    external: true
```

Catatan:

- `expose: 3000` cukup untuk komunikasi antar-container
- port app tidak perlu dibuka ke publik jika semua trafik masuk lewat NPM
- `CORS_ORIGIN` sebaiknya domain final publik Anda
- `NODE_ENV=production` diperlukan agar backend melayani file frontend build

### Jika ingin tetap bisa cek dari host lokal VPS

Anda bisa menambahkan port loopback sekaligus:

```yaml
ports:
  - "127.0.0.1:3000:3000"
```

Dengan ini:

- NPM container tetap bisa memakai network internal `app:3000`
- Anda juga tetap bisa `curl http://127.0.0.1:3000/health` dari host VPS

Namun jika tidak perlu debug dari host, `expose` saja sudah cukup.

---

## 8. Jalankan Container App

```bash
docker compose up -d
```

Ringkasannya:

- container memakai image `oven/bun`
- frontend build di-mount dari `frontend/dist`
- backend source di-mount dari `backend/`
- app dijalankan dari `/app/backend`
- untuk skenario NPM container, service app harus join ke network yang sama dengan NPM

---

## 9. Konfigurasi Nginx Proxy Manager

### Jika NPM proxy ke host loopback

Di NPM:

- Domain Names: `domain-anda.com`
- Scheme: `http`
- Forward Hostname / IP: `127.0.0.1`
- Forward Port: `3000`

### Jika NPM proxy ke container app

Di NPM:

- Domain Names: `domain-anda.com`
- Scheme: `http`
- Forward Hostname / IP: `app`
- Forward Port: `3000`

Catatan:

- NPM meneruskan **semua request domain** ke app
- Anda **tidak perlu** proxy path `/api` secara terpisah
- Karena frontend dan backend satu origin, browser akan memanggil `/api` relatif ke domain yang sama
- `Forward Hostname / IP` harus sama dengan nama service/container yang bisa dilihat NPM di network bersama

### SSL

Di tab SSL pada NPM:

- Request a new SSL Certificate
- Force SSL
- HTTP/2 Support
- HSTS opsional sesuai kebutuhan

---

## 10. Jalankan Migrasi dan Seed

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

## 11. Verifikasi Deploy

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

Lalu cek domain publik:

```bash
curl -I https://domain-anda.com
curl https://domain-anda.com/health
curl https://domain-anda.com/api/auth
```

### Cek auth mode

Cek status auth:

```bash
curl https://domain-anda.com/api/auth
```

Jika `auth_enabled` bernilai `false`, aplikasi bisa diakses langsung.

Jika `auth_enabled` bernilai `true`, ambil token dulu:

```bash
curl -s https://domain-anda.com/api/auth \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"password":"PASSWORD_APP_ANDA"}'
```

Lalu pakai token itu untuk test endpoint:

```bash
curl https://domain-anda.com/api/subjects -H "x-auth-token: TOKEN_ANDA"
```

Jika auth nonaktif:

```bash
curl https://domain-anda.com/api/subjects
```

---

## 12. Checklist Produksi Satu Domain

Sebelum dianggap selesai:

- app build frontend sudah ada di `frontend/dist`
- `bun run seed:check` lulus
- migrasi database sudah dijalankan
- seed sudah dijalankan
- `https://domain-anda.com/health` mengembalikan `{"status":"ok"}`
- `https://domain-anda.com/api/auth` bisa diakses
- frontend di domain utama bisa memanggil `/api/*` tanpa domain kedua

---

## 13. Update Kode

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

### Frontend jalan, tapi `/api` gagal dari domain publik

Periksa:

1. NPM meneruskan seluruh domain ke app, bukan hanya `/`
2. `CORS_ORIGIN` sesuai domain publik
3. app benar-benar menerima request `/api/*`
4. jika NPM dalam Docker, target upstream bukan `127.0.0.1` melainkan hostname service/container yang benar

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
