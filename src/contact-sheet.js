const PLACEHOLDER = '/src/assets/placeholder-thumb.svg';

async function fetchReps() {
  const res = await fetch('/api/reps');
  return res.json();
}

function setCandidate(id, candidate) {
  return fetch('/api/candidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, candidate }),
  });
}

function cardHTML(rep) {
  const thumb = rep.hasThumb ? `/reps/${rep.id}/thumb.gif` : PLACEHOLDER;
  return `
    <div class="rep-card" data-id="${rep.id}" data-phase="${rep.phase}">
      <img class="rep-card-thumb" src="${thumb}" loading="lazy" alt="${rep.title || rep.id}" />
      <div class="rep-card-body">
        <div class="rep-card-title">${rep.title || rep.id}</div>
        <div class="rep-card-meta">
          <span>Phase ${rep.phase} · ${rep.date || ''}</span>
          <label class="rep-card-candidate" title="Mark as candidate">
            <input type="checkbox" class="candidate-toggle" ${rep.candidate ? 'checked' : ''} />
            ★
          </label>
        </div>
      </div>
    </div>`;
}

function render(reps, activePhase) {
  const grid = document.getElementById('rep-grid');
  const filtered = activePhase === 'all' ? reps : reps.filter((r) => String(r.phase) === activePhase);

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">No reps yet — run <code>npm run rep</code> to create the first one.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(cardHTML).join('');

  grid.querySelectorAll('.rep-card').forEach((card) => {
    const id = card.dataset.id;
    card.addEventListener('click', (e) => {
      if (e.target.closest('.rep-card-candidate')) return;
      location.href = `rep.html?id=${id}`;
    });
    const checkbox = card.querySelector('.candidate-toggle');
    checkbox.addEventListener('click', (e) => e.stopPropagation());
    checkbox.addEventListener('change', () => setCandidate(id, checkbox.checked));
  });
}

function renderFilterBar(reps, activePhase, onChange) {
  const bar = document.getElementById('filter-bar');
  const phases = Array.from(new Set(reps.map((r) => String(r.phase)))).sort((a, b) => Number(a) - Number(b));

  const buttons = ['all', ...phases].map(
    (phase) =>
      `<button data-phase="${phase}" class="${phase === activePhase ? 'active' : ''}">${
        phase === 'all' ? 'All' : `Phase ${phase}`
      }</button>`
  );
  bar.innerHTML = buttons.join('');
  bar.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => onChange(btn.dataset.phase));
  });
}

async function main() {
  document.getElementById('app').innerHTML = `
    <div class="sheet">
      <h1>Motion Dojo</h1>
      <div class="sheet-sub">Daily motion reps — newest first.</div>
      <div class="filter-bar" id="filter-bar"></div>
      <div class="rep-grid" id="rep-grid"></div>
    </div>`;

  const reps = await fetchReps();
  let activePhase = 'all';

  function refresh() {
    renderFilterBar(reps, activePhase, (phase) => {
      activePhase = phase;
      refresh();
    });
    render(reps, activePhase);
  }

  refresh();
}

main();
