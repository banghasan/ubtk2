# Konfigurasi

## Jalankan Container App

```bash
docker compose up -d
```

## Konfigurasi Nginx Proxy Manager

### Proxy ke host loopback

- Domain Names: `domain-anda.com`
- Scheme: `http`
- Forward Hostname / IP: `127.0.0.1`
- Forward Port: `3000`

### Proxy ke container app

- Domain Names: `domain-anda.com`
- Scheme: `http`
- Forward Hostname / IP: `app`
- Forward Port: `3000`

Catatan:
- NPM meneruskan **semua request domain** ke app
- Tidak perlu proxy path `/api` secara terpisah
- Cukup satu Proxy Host untuk seluruh domain

## SSL

Di tab SSL pada NPM:
- Request a new SSL Certificate
- Force SSL
- HTTP/2 Support
- HSTS opsional

## Jalankan Migrasi dan Seed

```bash
docker compose exec app bun src/db/migrate.ts
docker compose exec app bun src/lib/seed.ts
```

Jika `seed.json` diubah di server:

```bash
bun run seed:check
docker compose exec app bun src/lib/seed.ts
```
