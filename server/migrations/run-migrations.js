import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('🔄 Checking database connection and running migrations...');

  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is not set in environment variables.');
    console.error('👉 Please configure DATABASE_URL in server/.env before running migrations.');
    process.exit(1);
  }

  let client;
  try {
    client = await pool.connect();
  } catch (connErr) {
    console.error(`\n❌ Could not connect to PostgreSQL server:`);
    console.error(`   ${connErr.message}`);
    console.error(`👉 Please ensure your PostgreSQL server is running, or provide your cloud database URL (Neon, Supabase, Render) in server/.env\n`);
    process.exit(1);
  }

  try {
    await client.query('BEGIN');

    // Create migrations tracker table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get list of executed migrations
    const executedRes = await client.query('SELECT filename FROM schema_migrations');
    const executedFiles = new Set(executedRes.rows.map((r) => r.filename));

    // Read migration files
    const files = fs
      .readdirSync(__dirname)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (!executedFiles.has(file)) {
        console.log(`➡️  Executing migration: ${file}`);
        const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        console.log(`✅ Completed: ${file}`);
      } else {
        console.log(`⏭️  Already applied: ${file}`);
      }
    }

    await client.query('COMMIT');
    console.log('🎉 All migrations applied successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

runMigrations();
