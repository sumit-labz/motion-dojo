import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import { phaseProgress } from './lib/curriculum.js';

const DEV_PORT = 5173;
const REPS_DIR = 'reps';

// This script no longer scaffolds a rep.js for you to hand-write. Under the
// current curriculum you direct in plain language; the rep.js gets written
// for you (by Claude, in conversation) and staged straight into this repo.
// What this script still does: pick today's id, create the folder, write a
// starter meta.json, and log the row — the bookkeeping around a session,
// not the session's content.

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

async function createOneSession(rl, lastPhase) {
  const phaseDefault = lastPhase ?? 1;
  const phaseAnswer = await rl.question(`Phase number [${phaseDefault}]: `);
  let phase = phaseAnswer.trim() ? Number.parseInt(phaseAnswer, 10) : phaseDefault;
  if (Number.isNaN(phase)) {
    console.warn('Could not parse a phase number, defaulting to 1.');
    phase = 1;
  }

  const progress = phaseProgress(phase);
  let prompt = '';
  if (progress) {
    console.log(`Phase ${phase} — ${progress.title}: ${progress.done}/${progress.total} sessions logged.`);
    if (progress.next) {
      const answer = await rl.question(`Session [Enter for next: "${progress.next}"]: `);
      prompt = answer.trim() || progress.next;
    } else {
      console.log(`All curriculum sessions for phase ${phase} are done — free session, or move to the next phase.`);
      while (!prompt.trim()) {
        prompt = await rl.question('What do you want to direct today? ');
        if (!prompt.trim()) console.log('Cannot be empty.');
      }
      prompt = prompt.trim();
    }
  } else {
    while (!prompt.trim()) {
      prompt = await rl.question('What do you want to direct today? ');
      if (!prompt.trim()) console.log('Cannot be empty.');
    }
    prompt = prompt.trim();
  }

  const { today, id } = nextId();
  const dir = path.join(REPS_DIR, id);
  fs.mkdirSync(dir, { recursive: true });

  const title = prompt.length > 60 ? `${prompt.slice(0, 57)}...` : prompt;
  const meta = {
    title,
    phase,
    prompt,
    notes: '',
    date: today,
    candidate: false,
    fps: 60,
    duration: null,
    // No rep.js yet — bring this prompt to Claude to have it written and
    // staged here. Once it exists, `npm run dev` + this rep's URL works as
    // normal for reviewing/judging.
    status: 'awaiting-direction',
  };
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');

  const label = appendLogRow({ today, phase, prompt });

  console.log(`\nCreated reps/${id}/ (no rep.js yet)`);
  console.log(`Logged as row #${label} in LOG.md`);
  console.log(`\nBring this to Claude:`);
  console.log(`  "Direct reps/${id}/: ${prompt}"`);
  console.log(`\nOnce Claude writes reps/${id}/rep.js, review it at:`);
  console.log(`  http://localhost:${DEV_PORT}/rep.html?id=${id}\n`);

  return phase;
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });

  let lastPhase;
  let again = true;
  while (again) {
    lastPhase = await createOneSession(rl, lastPhase);
    const answer = (await rl.question('Another session now? [Y/n]: ')).trim().toLowerCase();
    again = answer !== 'n' && answer !== 'no';
  }

  rl.close();
}

main();
