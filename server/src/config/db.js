import pg from 'pg';
import dotenv from 'dotenv';
import { memoryStore } from './memoryStore.js';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

let isInMemoryFallback = false;

const poolConfig = {
  connectionString,
  // Automatically configure SSL for cloud PostgreSQL (Neon, Supabase, Render, Aiven)
  ...(process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require') || process.env.NODE_ENV === 'production'
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
};

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  if (!isInMemoryFallback) {
    console.error('PostgreSQL idle client notice:', err.message);
  }
});

/**
 * Execute parameterized SQL query with automatic in-memory fallback
 * @param {string} text - SQL query string with $1, $2 placeholders
 * @param {Array} params - Array of parameters
 */
export const query = async (text, params = []) => {
  const start = Date.now();

  // If already running in in-memory fallback mode
  if (isInMemoryFallback) {
    const res = await memoryStore.execute(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[In-Memory DB Query] ${text.replace(/\s+/g, ' ').slice(0, 60)}... duration: ${duration}ms, rows: ${res.rowCount}`);
    }
    return res;
  }

  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB Query] ${text.replace(/\s+/g, ' ').slice(0, 60)}... duration: ${duration}ms, rows: ${res.rowCount}`);
    }
    return res;
  } catch (error) {
    // If PostgreSQL is unreachable or disconnected, switch to zero-config in-memory store
    const isConnError =
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('connect ECONNREFUSED') ||
      error.message?.includes('timeout');

    if (isConnError) {
      console.warn(`[DB Notice] PostgreSQL connection failed (${error.message}). Seamlessly switched to local in-memory storage.`);
      isInMemoryFallback = true;
      return memoryStore.execute(text, params);
    }

    console.error(`[DB Error executing query]:`, { text, error: error.message });
    throw error;
  }
};

/**
 * Check database connectivity
 */
export const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() AS current_time');
    isInMemoryFallback = false;
    return { connected: true, inMemory: false, time: res.rows[0].current_time };
  } catch (err) {
    isInMemoryFallback = true;
    console.log(`[DB Info] PostgreSQL not reachable (${err.message}). Using local zero-config in-memory storage.`);
    return {
      connected: true,
      inMemory: true,
      note: 'Using local in-memory store (zero configuration mode)',
    };
  }
};

export default {
  pool,
  query,
  testConnection,
};
