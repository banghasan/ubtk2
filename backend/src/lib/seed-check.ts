import fs from 'node:fs';
import path from 'node:path';
import { parseSeedData } from './seed';

async function main() {
  const seedPath = path.join(process.cwd(), '..', 'seed.json');
  const raw = fs.readFileSync(seedPath, 'utf8');
  parseSeedData(JSON.parse(raw));
  console.log('[seed:check] Valid.');
}

main().catch((error) => {
  console.error('[seed:check] Failed:', error);
  process.exit(1);
});
