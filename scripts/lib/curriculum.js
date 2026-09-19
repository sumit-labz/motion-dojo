import fs from 'node:fs';
import path from 'node:path';

const CURRICULUM_PATH = 'curriculum.json';
const REPS_DIR = 'reps';

export function loadCurriculum() {
  if (!fs.existsSync(CURRICULUM_PATH)) return { phases: [] };
  return JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf-8'));
}

export function phaseEntry(curriculum, phase) {
  return curriculum.phases.find((p) => p.phase === phase) || null;
}

function normalize(text) {
  return text.trim().toLowerCase();
}

// Prompts already used for a given phase, read live from each rep's meta.json.
export function completedPromptsForPhase(phase) {
  if (!fs.existsSync(REPS_DIR)) return new Set();
  const done = new Set();
  for (const name of fs.readdirSync(REPS_DIR)) {
    const metaPath = path.join(REPS_DIR, name, 'meta.json');
    if (!fs.existsSync(metaPath)) continue;
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      if (meta.phase === phase && meta.prompt) done.add(normalize(meta.prompt));
    } catch {
      // skip unreadable meta.json
    }
  }
  return done;
}

/** { done, total, next } for one phase, or null if the phase has no curriculum entry. */
export function phaseProgress(phase) {
  const entry = phaseEntry(loadCurriculum(), phase);
  if (!entry) return null;
  const completed = completedPromptsForPhase(phase);
  const remaining = entry.lessons.filter((l) => !completed.has(normalize(l)));
  return {
    title: entry.title,
    total: entry.lessons.length,
    done: entry.lessons.length - remaining.length,
    next: remaining[0] || null,
  };
}
