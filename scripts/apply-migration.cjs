const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString =
  process.env.SUPABASE_DATABASE_URL ||
  `postgresql://postgres.${process.env.SUPABASE_REF}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-${process.env.SUPABASE_REGION || 'eu-west-1'}.pooler.supabase.com:5432/postgres`;

const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '001_initial.sql'), 'utf8');

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    await client.connect();
    await client.query(sql);
    console.log('Migration applied successfully');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
