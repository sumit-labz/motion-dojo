const ASPECT_RATIOS = {
  '16:9': '16 / 9',
  '4:5': '4 / 5',
  '9:16': '9 / 16',
};

/**
 * Builds a fixed-aspect, letterboxed stage inside `container`.
 * Returns the stage API every rep.js build(stage) receives.
 */
export function createStage(container, { aspect = '16:9' } = {}) {
  container.innerHTML = '';

  const viewport = document.createElement('div');
  viewport.className = 'stage-viewport';

  const stageEl = document.createElement('div');
  stageEl.className = 'stage';
  stageEl.style.aspectRatio = ASPECT_RATIOS[aspect] || ASPECT_RATIOS['16:9'];
  stageEl.style.width = '100%';
  stageEl.style.height = 'auto';
  stageEl.style.maxHeight = '100%';

  const content = document.createElement('div');
  content.className = 'stage-content';

  const safe5 = document.createElement('div');
  safe5.className = 'stage-safe-area inset-5';
  const safe10 = document.createElement('div');
  safe10.className = 'stage-safe-area inset-10';

  const grid = document.createElement('div');
  grid.className = 'stage-grid';

  stageEl.append(content, safe5, safe10, grid);
  viewport.append(stageEl);
  container.append(viewport);

  return {
    el: content,

    add(html) {
      if (typeof html === 'string') {
        const frag = document.createRange().createContextualFragment(html);
        const nodes = Array.from(frag.children);
        content.append(frag);
        return nodes.length === 1 ? nodes[0] : nodes;
      }
      content.append(html);
      return html;
    },

    type(text, { size = 3, weight = 400, tracking = 0, font = 'inter' } = {}) {
      const el = document.createElement('div');
      el.className = 'type';
      el.textContent = text;
      el.style.fontFamily = font === 'mono' ? 'var(--font-mono)' : 'var(--font-inter)';
      el.style.fontSize = `var(--fs-${size})`;
      el.style.fontVariationSettings = `'wght' ${weight}`;
      el.style.letterSpacing = `${tracking}em`;
      content.append(el);
      return el;
    },

    setSafeAreaVisible(visible) {
      stageEl.classList.toggle('show-safe', visible);
    },

    setGridVisible(visible) {
      stageEl.classList.toggle('show-grid', visible);
    },

    destroy() {
      container.innerHTML = '';
    },
  };
}
