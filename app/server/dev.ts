import { serve } from '@hono/node-server';
import { app } from './index';

const port = parseInt(process.env.PORT || '3001');

console.log(`🚀 Server starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`✅ Server is running at http://localhost:${info.port}`);
  console.log(`📍 API endpoints available at http://localhost:${info.port}/api`);
});
