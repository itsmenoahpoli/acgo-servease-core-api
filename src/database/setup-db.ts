import { Client } from 'pg';
import { config } from 'dotenv';

config();

async function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }

  const match = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }

  const [, user, password, host, port, dbName] = match;
  const adminUrl = `postgresql://${user}:${password}@${host}:${port}/postgres`;

  console.log(`📦 Creating database: ${dbName}...`);

  const adminClient = new Client({ connectionString: adminUrl });
  try {
    await adminClient.connect();
    const result = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName],
    );
    if (result.rows.length === 0) {
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created successfully`);
    } else {
      console.log(`✅ Database "${dbName}" already exists`);
    }
  } catch (error: any) {
    if (error.code === '3D000') {
      console.log(`⚠️  Database "${dbName}" does not exist, but cannot create it automatically.`);
      console.log(`Please create it manually: CREATE DATABASE ${dbName};`);
    } else {
      throw error;
    }
  } finally {
    await adminClient.end();
  }
}

setupDatabase().catch((error) => {
  console.error('❌ Error setting up database:', error.message);
  process.exit(1);
});

