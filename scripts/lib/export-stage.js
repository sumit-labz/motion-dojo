// A trimmed variant of src/stage.js for HyperFrames export.
//
// The dev harness's stage.js builds a letterboxed viewport because the
// preview window's aspect doesn't match the rep's aspect. In a HyperFrames
// composition the root element IS the exact render canvas (sized via
// data-width/data-height), so there's no letterboxing to do — this just
// gives build(stage) the same add()/type() API, rooted directly at #hf-root.
// Grid/safe-area are editing aids only; they're no-ops here so they never
// leak into a render even if a rep calls them unconditionally.
export function createExportStage(root) {
  root.innerHTML = '';

  const content = document.createElement('div');
  content.style.position = 'absolute';
  content.style.inset = '0';
  root.append(content);

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
      el.style.color = 'var(--ink)';
      el.style.fontFamily = font === 'mono' ? 'var(--font-mono)' : 'var(--font-inter)';
      el.style.lineHeight = '1.05';
      el.style.whiteSpace = 'nowrap';
      el.style.fontSize = `var(--fs-${size})`;
      el.style.fontVariationSettings = `'wght' ${weight}`;
      el.style.letterSpacing = `${tracking}em`;
      content.append(el);
      return el;
    },

    setSafeAreaVisible() {},
    setGridVisible() {},
  };
}
