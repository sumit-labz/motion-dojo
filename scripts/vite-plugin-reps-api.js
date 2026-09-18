import { readAllReps } from './lib/read-reps.js';

export function repsApiPlugin() {
  return {
    name: 'reps-api',
    configureServer(server) {
      server.middlewares.use('/api/reps', (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          return res.end();
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(readAllReps()));
      });
    },
  };
}
