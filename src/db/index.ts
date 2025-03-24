import 'dotenv/config';
import * as schema from './schema.js';
import { drizzle } from 'drizzle-orm/node-postgres';

export const db = drizzle({ connection: process.env.DATABASE_URL!, schema });
