# Verifikasi

## Cek Dasar

```bash
docker compose ps
docker compose logs -f
curl http://localhost:3000/health
```

Response:

```json
{ "status": "ok" }
```

## Cek Domain Publik

```bash
curl -I https://domain-anda.com
curl https://domain-anda.com/health
curl https://domain-anda.com/api/auth
```

## Cek Auth Mode

```bash
curl https://domain-anda.com/api/auth
```

Jika `auth_enabled: false` → aplikasi bisa diakses langsung.

Jika `auth_enabled: true` → ambil token:

```bash
TOKEN=$(curl -s https://domain-anda.com/api/auth \
  -X POST -H 'Content-Type: application/json' \
  -d '{"password":"PASSWORD_APP_ANDA"}' | python3 -c 'import sys,json; print(json.load(sys.stdin)["token"])')

curl https://domain-anda.com/api/subjects -H "x-auth-token: $TOKEN"
```

Jika auth nonaktif:

```bash
curl https://domain-anda.com/api/subjects
```
