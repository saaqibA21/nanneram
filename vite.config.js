import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Serves api/*.js during `npm run dev`, mirroring Vercel's serverless functions.
function localApi() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api/', async (req, res, next) => {
        const name = req.url.split('?')[0].replace(/^\//, '');
        if (!/^[a-z-]+$/.test(name)) return next();
        let body = '';
        for await (const chunk of req) body += chunk;
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.js`);
          req.body = body ? JSON.parse(body) : undefined;
          res.status = (code) => { res.statusCode = code; return res; };
          res.json = (data) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); return res; };
          await mod.default(req, res);
        } catch (err) {
          server.config.logger.error(err.stack || String(err));
          if (!res.headersSent) { res.statusCode = 500; res.end('{"error":"server_error"}'); }
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), localApi()],
  server: {
    port: 5500,
    strictPort: true,
  },
});
