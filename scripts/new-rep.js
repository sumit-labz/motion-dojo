import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import fs from 'node:fs';
import path from 'node:path';

const DEV_PORT = 5173;
const REPS_DIR = 'reps';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function nextId() {
  const today = todayStr();
  fs.mkdirSync(REPS_DIR, { recursive: true });
  const existing = fs
    .readdirSync(REPS_DIR)
    .map((name) => name.match(new RegExp(`^${today}-(\\d\\d)$`)))
    .filter(Boolean)
    .map((m) => Number(m[1]));
  const nextNN = existing.length ? Math.max(...existing) + 1 : 1;
  return { today, id: `${today}-${String(nextNN).padStart(2, '0')}` };
}

function escapeForTable(text) {
  return text.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function appendLogRow({ id, today, phase, prompt }) {
  const logPath = 'LOG.md';
  const content = fs.readFileSync(logPath, 'utf-8');
  const rowLines = content
    .split('\n')
    .filter((line) => /^\|\s*\d+\s*\|/.test(line));
  const n = rowLines.length + 1;
  const row = `| ${n} | ${today} | ${phase} | ${escapeForTable(prompt)} | | |\n`;
  fs.writeFileSync(logPath, content.replace(/\n?$/, '\n') + row);
  return n;
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });

  let phaseAnswer = await rl.question('Phase number: ');
  let phase = Number.parseInt(phaseAnswer, 10);
  if (Number.isNaN(phase)) {
    console.warn('Could not parse a phase number, defaulting to 0.');
    phase = 0;
  }

  let prompt = '';
  while (!prompt.trim()) {
    prompt = await rl.question('Prompt / brief for this rep: ');
    if (!prompt.trim()) console.log('Prompt cannot be empty.');
  }
  prompt = prompt.trim();

  rl.close();

  const { today, id } = nextId();
  const dir = path.join(REPS_DIR, id);
  fs.mkdirSync(dir, { recursive: true });

  const template = fs.readFileSync(path.join('templates', 'template.js'), 'utf-8');
  const title = prompt.length > 60 ? `${prompt.slice(0, 57)}...` : prompt;
  const repSource = template
    .replace('TITLE', title.replace(/'/g, "\\'"))
    .replace('PHASE', String(phase))
    .replace('PROMPT', prompt.replace(/'/g, "\\'"));
  fs.writeFileSync(path.join(dir, 'rep.js'), repSource);

  const meta = {
    title,
    phase,
    prompt,
    notes: '',
    date: today,
    candidate: false,
    fps: 60,
    duration: null,
  };
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');

  const n = appendLogRow({ id, today, phase, prompt });

  console.log(`\nCreated reps/${id}/`);
  console.log(`Logged as row #${n} in LOG.md`);
  console.log(`\n  http://localhost:${DEV_PORT}/rep.html?id=${id}\n`);
}

main();
