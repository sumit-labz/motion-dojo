import fs from 'node:fs';
import path from 'node:path';

const REPS_DIR = 'reps';

export function readAllReps() {
  if (!fs.existsSync(REPS_DIR)) return [];

  return fs
    .readdirSync(REPS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const id = entry.name;
      const metaPath = path.join(REPS_DIR, id, 'meta.json');
      if (!fs.existsSync(metaPath)) return null;
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        const hasThumb = fs.existsSync(path.join(REPS_DIR, id, 'thumb.gif'));
        return { id, ...meta, hasThumb };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => (a.id < b.id ? 1 : -1));
}
