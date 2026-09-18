import fs from 'node:fs';
import path from 'node:path';

const ID_RE = /^[\w-]+$/;

export function candidatesPlugin() {
  return {
    name: 'candidates-api',
    configureServer(server) {
      server.middlewares.use('/api/candidate', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end();
        }
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          try {
            const { id, candidate } = JSON.parse(body);
            if (!ID_RE.test(id)) {
              res.statusCode = 400;
              return res.end('invalid id');
            }
            const metaPath = path.join('reps', id, 'meta.json');
            if (!fs.existsSync(metaPath)) {
              res.statusCode = 404;
              return res.end('not found');
            }
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
            meta.candidate = !!candidate;
            fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          } catch (e) {
            res.statusCode = 400;
            res.end(String(e));
          }
        });
      });
    },
  };
}
