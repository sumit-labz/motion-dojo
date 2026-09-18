import fs from 'node:fs';
import { readAllReps } from './lib/read-reps.js';

const reps = readAllReps();
fs.writeFileSync('reps-index.json', JSON.stringify(reps, null, 2) + '\n');
console.log(`Wrote reps-index.json (${reps.length} reps).`);
console.log('Note: the contact sheet reads live via /api/reps during `npm run dev` — this file is an optional static snapshot, not required for daily use.');
