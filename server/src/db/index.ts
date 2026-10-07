import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import * as schema from './schema';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dbPath = process.env.DATABASE_PATH || './shark-tank.db';
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize better-sqlite3 with WAL mode for performance
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

// Create drizzle instance
export const db = drizzle(sqlite, { schema });
