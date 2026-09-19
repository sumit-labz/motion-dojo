import { gsap } from 'gsap';

export default {
  meta: {
    title: 'One word fades in at three durations — find the true one',
    phase: 1,
    prompt: 'One word fades in at three durations — find the true one',
    notes: '',
  },
  aspect: '16:9',
  build(stage) {
    const tl = gsap.timeline({ paused: true });

    // your animation here
    const word = stage.type('TYPOGRAPHY', { size: 4, weight: 600 });
    tl.from(word, { opacity: 0.5, y: 30, duration: 1.6, ease: 'power2.out' });

    return tl;
  },
};
