# Docker Network & Topologi NPM

## Buat Docker Network Bersama

Jika NPM berjalan sebagai container, buat satu network:

```bash
docker network create npm_network
```

## Topologi NPM

### Opsi A — NPM berjalan di host VPS

App cukup bind ke loopback:

```yaml
ports:
  - "127.0.0.1:3000:3000"
```

NPM meneruskan ke `http://127.0.0.1:3000`.

### Opsi B — NPM berjalan sebagai container

App harus join ke network yang sama dengan NPM. Gunakan `expose` bukan `ports`:

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

NPM upstream: `app:3000`.

### Ingin tetap bisa `curl` dari host?

Tambah port loopback:

```yaml
ports:
  - "127.0.0.1:3000:3000"
```

Container tetap bisa diakses via `app:3000` dari internal Docker, dan via `127.0.0.1:3000` dari host.

## Contoh Stack NPM + App

### A. Nginx Proxy Manager

```yaml
services:
  npm:
    image: jc21/nginx-proxy-manager:latest
    restart: unless-stopped
    ports:
      - "80:80"
      - "81:81"
      - "443:443"
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    networks:
      - npm_network

networks:
  npm_network:
    external: true
```

### B. App

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

NPM dan app tidak harus dalam file compose yang sama. Yang penting keduanya join ke `npm_network`.
