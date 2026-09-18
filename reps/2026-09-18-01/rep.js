import { gsap } from 'gsap';

export default {
  meta: {
    title: 'Word fade + rise',
    phase: 1,
    prompt: 'Fade in and move a single word using power2.out',
    notes: '',
  },
  aspect: '16:9',
  build(stage) {
    const word = stage.type('MOTION', { size: 5, weight: 600, tracking: 0.02 });
    gsap.set(word, { opacity: 0, y: 40 });

    const tl = gsap.timeline({ paused: true });
    tl.to(word, { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out' });

    return tl;
  },
};
