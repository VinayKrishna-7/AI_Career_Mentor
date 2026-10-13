import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { testConnection } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  const dbStatus = await testConnection();

  app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 AI Career Mentor API Server running on port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🗄️  Database: ${dbStatus.inMemory ? '⚡ In-Memory Storage Active (Zero setup mode)' : (dbStatus.connected ? '🟢 PostgreSQL Connected' : '🔴 Disconnected')}`);
    console.log(`=================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
