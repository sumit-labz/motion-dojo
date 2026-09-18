import { gsap } from 'gsap';
// Phase 6 scaffold — not wired into `npm run rep` yet. Copy this file manually
// when you start doing 3D/text-mesh reps.
//
// import * as THREE from 'three';
// import { Text } from 'troika-three-text';

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

    // Phase 6: set up a three.js scene/renderer inside stage.el and drive it
    // via a gsap onUpdate callback, or animate a troika-three-text Text mesh's
    // .position/.rotation/.material via gsap.to(). Nothing wired yet.

    return tl;
  },
};
