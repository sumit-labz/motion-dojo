import { defineConfig } from 'vite';
import { repsApiPlugin } from './scripts/vite-plugin-reps-api.js';
import { candidatesPlugin } from './scripts/vite-plugin-candidates.js';

export default defineConfig({
  plugins: [repsApiPlugin(), candidatesPlugin()],
});
