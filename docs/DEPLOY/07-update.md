# Update

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

Setelah update:

```bash
curl http://localhost:3000/health
docker compose logs --tail=100
```
