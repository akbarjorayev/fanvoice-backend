import { Pool, types } from 'pg';
import dotenv from 'dotenv';
import { IS_PRODUCTION } from '../constants/env';

dotenv.config();

// pg returns BIGINT/NUMERIC as strings by default to avoid precision loss on
// very large values. Our amounts (so'm prices) never approach
// Number.MAX_SAFE_INTEGER, so parse them as real numbers instead — otherwise
// they silently reach the frontend as JSON strings despite being typed `number`.
types.setTypeParser(20, (val) => parseInt(val, 10)); // int8 / bigint
types.setTypeParser(1700, (val) => Number(val)); // numeric

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: IS_PRODUCTION ? { rejectUnauthorized: false } : false,
});

db.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(1);
});
