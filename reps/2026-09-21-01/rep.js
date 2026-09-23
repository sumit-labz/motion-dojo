import { gsap } from 'gsap';

// Phase 1 — Layout and staging (STATIC FRAME, no motion).
// Locked composition, directed 2026-09-23: a dilatational-adjacent arrangement
// of the four fragments of "Inception doesn't end. It stops." — four circles
// laid out along a sine-wave path (low / high / low / high, left to right),
// with weight (size + font weight) carrying the hierarchy: "Inception" reads
// first and dominates, "It stops" is the second-strongest beat, "doesn't" and
// "end" recede in between.
export default {
  meta: {
    title: 'Pick a still from the reference pack. Direct a layout wit...',
    phase: 1,
    prompt:
      'Pick a still from the reference pack. Direct a layout with the same weight distribution, different words.',
    notes:
      'Dilatational-system study on "Inception doesn\'t end. It stops," split into four fragments. Weight hierarchy: Inception (dominant) > It stops (second) > doesn\'t > end. Position: sine-wave path, low/high/low/high left to right. Directed 2026-09-23.',
  },
  aspect: '16:9',
  build(stage) {
    const tl = gsap.timeline({ paused: true });

    // Four fragments, in reading order left to right.
    const words = [
      { text: 'Inception', size: 5, weight: 700, xPct: 14, yPct: 74 }, // dominant, low
      { text: 'doesn’t', size: 3, weight: 400, xPct: 40, yPct: 26 }, // recedes, high
      { text: 'end', size: 2, weight: 400, xPct: 62, yPct: 74 }, // smallest, low
      { text: 'It stops', size: 4, weight: 600, xPct: 86, yPct: 26 }, // second-dominant, high
    ];

    words.forEach(({ text, size, weight, xPct, yPct }) => {
      const el = stage.type(text, { size, weight });
      gsap.set(el, {
        position: 'absolute',
        left: `${xPct}%`,
        top: `${yPct}%`,
        xPercent: -50,
        yPercent: -50,
      });
    });

    // Static frame: nothing animates. The timeline exists only to satisfy
    // the rep contract (HyperFrames seeks a paused timeline even when the
    // whole point of this rep is that it never moves).
    return tl;
  },
};
