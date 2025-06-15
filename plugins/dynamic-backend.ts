// frontend/plugins/dynamic-backend.ts
import axios from 'axios';
import { request as httpRequest } from 'http';

const possiblePorts = ['8000', '8001', '8002'];

async function findBackendPort(): Promise<string> {
  for (const port of possiblePorts) {
    const url = `http://localhost:${port}/api/port/`;
    try {
      const response = await axios.get(url, { timeout: 1000 });
      const detectedPort = response.data.port;
      console.log(`Backend found on port ${detectedPort}`);
      return `http://localhost:${detectedPort}`;
    } catch (err) {
      console.log(`Port ${port} unavailable`);
    }
  }
  console.warn('No backend found, falling back to port 8000');
  return '${import.meta.env.VITE_API_BASE_URL}';
}

export default function dynamicBackendPlugin(): any {
  let backendUrl: string | null = null;

  return {
    name: 'dynamic-backend',
    async configureServer(server: any) {
      backendUrl = await findBackendPort();

      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url.startsWith('/api')) {
          req.url = req.url.replace(/^\/api/, '');
          const proxyReq = httpRequest(
            {
              hostname: 'localhost',
              port: Number(backendUrl!.split(':')[2]),
              path: `/api${req.url}`,
              method: req.method,
              headers: req.headers,
            },
            (proxyRes: any) => {
              res.writeHead(proxyRes.statusCode, proxyRes.headers);
              proxyRes.pipe(res, { end: true });
            }
          );
          req.pipe(proxyReq, { end: true });
        } else {
          next();
        }
      });
    },
  };
}