import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import app from './app.js';
import { connectDatabase } from './config/database.js';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const port = Number(process.env.PORT) || 5000;
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret === 'replace-with-a-long-random-secret' || Buffer.byteLength(jwtSecret, 'utf8') < 32) {
  console.error('Startup failed: JWT_SECRET must be a random value at least 32 bytes long.');
  process.exit(1);
}

try {
  await connectDatabase();
  app.listen(port, '127.0.0.1', () => {
    console.info('CampusFind API listening on http://127.0.0.1:' + port);
  });
} catch (error) {
  console.error('Startup failed: ' + error.message);
  process.exitCode = 1;
}
