import { gsap } from 'gsap';

export default {
  meta: {
    title: 'TITLE',
    phase: PHASE,
    prompt: 'PROMPT',
    notes: '',
  },
  aspect: '16:9',
  build(stage) {
    const tl = gsap.timeline({ paused: true });

    // your animation here
    // const word = stage.type('HELLO', { size: 4, weight: 600 });
    // tl.from(word, { opacity: 0, y: 30, duration: 0.8, ease: 'power2.out' });

    return tl;
  },
};
