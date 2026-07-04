import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { db } from './config/database';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

async function start() {
  await db.connect();
  console.log('Connected to database');

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
