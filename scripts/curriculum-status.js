import { loadCurriculum, phaseProgress } from './lib/curriculum.js';

function bar(done, total, width = 20) {
  const filled = total === 0 ? 0 : Math.round((done / total) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function main() {
  const curriculum = loadCurriculum();
  if (!curriculum.phases.length) {
    console.log('No curriculum.json found (or it has no phases).');
    return;
  }

  console.log('Motion Dojo — self-paced curriculum\n');

  let totalDone = 0;
  let totalAll = 0;

  for (const entry of curriculum.phases) {
    const progress = phaseProgress(entry.phase);
    if (!progress) continue;
    totalDone += progress.done;
    totalAll += progress.total;

    console.log(`Phase ${entry.phase} — ${progress.title}`);
    console.log(`  ${bar(progress.done, progress.total)}  ${progress.done}/${progress.total}`);
    if (progress.next) {
      console.log(`  next: ${progress.next}`);
    } else {
      console.log('  done — free-rep this phase, or move on.');
    }
    console.log('');
  }

  console.log(`Overall: ${totalDone}/${totalAll} lessons logged.`);
  console.log('\nRun `npm run rep` any time — pick a phase, Enter accepts the suggested lesson.');
}

main();
