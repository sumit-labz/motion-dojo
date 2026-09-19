import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import { phaseProgress } from './lib/curriculum.js';

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

function appendLogRow({ today, phase, prompt }) {
  const logPath = 'LOG.md';
  const content = fs.readFileSync(logPath, 'utf-8');
  const rowNumbers = content
    .split('\n')
    .map((line) => line.match(/^\|\s*(\d+)\s*\|/))
    .filter(Boolean)
    .map((m) => Number(m[1]));
  const n = (rowNumbers.length ? Math.max(...rowNumbers) : 0) + 1;
  const label = String(n).padStart(3, '0');
  const row = `| ${label} | ${today} | ${phase} | ${escapeForTable(prompt)} | | |\n`;
  fs.writeFileSync(logPath, content.replace(/\n?$/, '\n') + row);
  return label;
}

async function createOneRep(rl, lastPhase) {
  const phaseDefault = lastPhase ?? 1;
  const phaseAnswer = await rl.question(`Phase number [${phaseDefault}]: `);
  let phase = phaseAnswer.trim() ? Number.parseInt(phaseAnswer, 10) : phaseDefault;
  if (Number.isNaN(phase)) {
    console.warn('Could not parse a phase number, defaulting to 0.');
    phase = 0;
  }

  const progress = phaseProgress(phase);
  let prompt = '';
  if (progress) {
    console.log(`Phase ${phase} — ${progress.title}: ${progress.done}/${progress.total} lessons logged.`);
    if (progress.next) {
      const answer = await rl.question(`Prompt [Enter for next lesson: "${progress.next}"]: `);
      prompt = answer.trim() || progress.next;
    } else {
      console.log(`All curriculum lessons for phase ${phase} are done — free rep, or move to the next phase.`);
      while (!prompt.trim()) {
        prompt = await rl.question('Prompt / brief for this rep: ');
        if (!prompt.trim()) console.log('Prompt cannot be empty.');
      }
      prompt = prompt.trim();
    }
  } else {
    while (!prompt.trim()) {
      prompt = await rl.question('Prompt / brief for this rep: ');
      if (!prompt.trim()) console.log('Prompt cannot be empty.');
    }
    prompt = prompt.trim();
  }

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

  const label = appendLogRow({ today, phase, prompt });

  console.log(`\nCreated reps/${id}/`);
  console.log(`Logged as row #${label} in LOG.md`);
  console.log(`  http://localhost:${DEV_PORT}/rep.html?id=${id}\n`);

  return phase;
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });

  let lastPhase;
  let again = true;
  while (again) {
    lastPhase = await createOneRep(rl, lastPhase);
    const answer = (await rl.question('Another rep now? [Y/n]: ')).trim().toLowerCase();
    again = answer !== 'n' && answer !== 'no';
  }

  rl.close();
}

main();
