import fs from 'node:fs';
import path from 'node:path';

// Enforces the HyperFrames-compatibility contract statically, across every
// rep.js, before any of it reaches an actual render:
//   - build(stage) must return a timeline built with gsap.timeline({ paused: true }).
//     HyperFrames seeks it frame-by-frame; a timeline that isn't paused/seekable
//     from construction produces a wrong or blank render.
//   - no requestAnimationFrame / Date.now / performance.now — anything driving
//     visual state off the wall clock instead of the timeline breaks determinism.
//   - no CSS animation/transition/@keyframes — same reason, a different mechanism.
//   - no hardcoded http(s):// URLs — fonts/assets/styles must resolve locally,
//     since HyperFrames renders with no network access.

const REPS_DIR = 'reps';

const RULES = [
  {
    id: 'no-raf',
    pattern: /\brequestAnimationFrame\s*\(/g,
    message: 'requestAnimationFrame() drives state off the wall clock. Drive it from the returned timeline instead.',
  },
  {
    id: 'no-date-now',
    pattern: /\bDate\.now\s*\(/g,
    message: 'Date.now() is a render-time clock. HyperFrames seeks frames out of order; this will not be deterministic.',
  },
  {
    id: 'no-performance-now',
    pattern: /\bperformance\.now\s*\(/g,
    message: 'performance.now() is a render-time clock. Drive motion from the returned timeline instead.',
  },
  {
    id: 'no-css-transition',
    pattern: /\btransition\s*:/g,
    message: 'CSS transition runs on the wall clock, not the seekable timeline. Animate this with GSAP instead.',
  },
  {
    id: 'no-css-animation',
    pattern: /@keyframes\b|\banimation\s*:/g,
    message: 'CSS @keyframes/animation run on the wall clock, not the seekable timeline. Animate this with GSAP instead.',
  },
  {
    id: 'no-network',
    pattern: /https?:\/\//g,
    message: 'Hardcoded network URL. Fonts/styles/assets must resolve from the rep folder or a shared local dir — no CDN, no network at render time.',
  },
];

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

function checkPausedTimeline(text, file) {
  const violations = [];
  const callRe = /gsap\.timeline\s*\(([^)]*)\)/g;
  let match;
  while ((match = callRe.exec(text))) {
    const args = match[1];
    if (!/paused\s*:\s*true/.test(args)) {
      violations.push({
        file,
        line: lineOf(text, match.index),
        id: 'not-paused',
        message: 'gsap.timeline() must be created with { paused: true } — HyperFrames seeks it per frame rather than playing it.',
      });
    }
  }
  return violations;
}

function lintFile(file) {
  const text = fs.readFileSync(file, 'utf-8');
  const violations = [];

  for (const rule of RULES) {
    let match;
    const re = new RegExp(rule.pattern);
    while ((match = re.exec(text))) {
      violations.push({ file, line: lineOf(text, match.index), id: rule.id, message: rule.message });
      if (!rule.pattern.global) break;
    }
  }

  violations.push(...checkPausedTimeline(text, file));

  return violations;
}

function main() {
  if (!fs.existsSync(REPS_DIR)) {
    console.log('No reps/ directory found — nothing to lint.');
    return;
  }

  const repFiles = fs
    .readdirSync(REPS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(REPS_DIR, e.name, 'rep.js'))
    .filter((p) => fs.existsSync(p));

  let allViolations = [];
  for (const file of repFiles) {
    allViolations = allViolations.concat(lintFile(file));
  }

  if (allViolations.length === 0) {
    console.log(`lint:reps — ${repFiles.length} rep(s) checked, all HyperFrames-compatible.`);
    return;
  }

  console.error(`lint:reps — ${allViolations.length} violation(s) found:\n`);
  for (const v of allViolations) {
    console.error(`  ${v.file}:${v.line}  [${v.id}]  ${v.message}`);
  }
  console.error('');
  process.exit(1);
}

main();
