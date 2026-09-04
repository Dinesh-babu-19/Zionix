import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc, sql as dsql } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as schema from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded if not already
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const NEON_DEFAULT_URL = 'postgresql://neondb_owner:npg_KCI3WyT4mdXV@ep-round-snow-aegffbe1-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';
const connectionString = (process.env.DATABASE_URL && process.env.DATABASE_URL.trim()) || NEON_DEFAULT_URL;

export const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

/**
 * Automatically create tables and seed initial data on startup.
 */
export async function initDb() {
  if (!sql) {
    console.error('[Neon DB] Cannot initialize database: DATABASE_URL is missing');
    return false;
  }

  try {
    console.log('[Neon DB] Initializing PostgreSQL database tables...');

    // 1. Create tables if they do not exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        avatar TEXT,
        joined_at TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS prayer_requests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'General Support',
        prayer_points TEXT NOT NULL,
        is_private BOOLEAN DEFAULT FALSE,
        submitted_at TEXT NOT NULL,
        formatted_date TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    console.log('[Neon DB] Database tables verified successfully.');

    // 2. Seed initial users from data/users.json if table is newly created
    try {
      const usersJsonPath = path.join(__dirname, '..', 'data', 'users.json');
      if (fs.existsSync(usersJsonPath)) {
        const fileContent = fs.readFileSync(usersJsonPath, 'utf8');
        const seedUsers = JSON.parse(fileContent);
        if (Array.isArray(seedUsers) && seedUsers.length > 0) {
          for (const u of seedUsers) {
            if (!u.email) continue;
            const normEmail = u.email.trim().toLowerCase();
            const id = u.id || `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            const name = u.name || normEmail.split('@')[0];
            const avatar = u.avatar || (name[0] ? name[0].toUpperCase() : 'Z');
            const joinedAt = u.joinedAt || new Date().toISOString();

            await sql`
              INSERT INTO users (id, name, email, avatar, joined_at)
              VALUES (${id}, ${name}, ${normEmail}, ${avatar}, ${joinedAt})
              ON CONFLICT (email) DO NOTHING;
            `;
          }
          console.log(`[Neon DB] Seeded ${seedUsers.length} baseline users into Neon users table.`);
        }
      }
    } catch (seedErr) {
      console.warn('[Neon DB] Note on seeding users:', seedErr.message);
    }

    // 3. Seed initial prayer requests from data/prayerRequests.json
    try {
      const prayersJsonPath = path.join(__dirname, '..', 'data', 'prayerRequests.json');
      if (fs.existsSync(prayersJsonPath)) {
        const fileContent = fs.readFileSync(prayersJsonPath, 'utf8');
        const seedPrayers = JSON.parse(fileContent);
        if (Array.isArray(seedPrayers) && seedPrayers.length > 0) {
          for (const p of seedPrayers) {
            if (!p.id || !p.prayerPoints) continue;
            const id = p.id;
            const name = p.name || 'Anonymous';
            const email = (p.email || '').trim().toLowerCase();
            const category = p.category || 'General Support';
            const prayerPoints = p.prayerPoints;
            const isPrivate = !!p.isPrivate;
            const submittedAt = p.submittedAt || new Date().toISOString();
            const formattedDate = p.formattedDate || 'Recently';

            await sql`
              INSERT INTO prayer_requests (id, name, email, category, prayer_points, is_private, submitted_at, formatted_date)
              VALUES (${id}, ${name}, ${email}, ${category}, ${prayerPoints}, ${isPrivate}, ${submittedAt}, ${formattedDate})
              ON CONFLICT (id) DO NOTHING;
            `;
          }
          console.log(`[Neon DB] Seeded baseline prayer requests into Neon prayer_requests table.`);
        }
      }
    } catch (seedPrayerErr) {
      console.warn('[Neon DB] Note on seeding prayer requests:', seedPrayerErr.message);
    }

    return true;
  } catch (err) {
    console.error('[Neon DB] Error initializing tables:', err);
    return false;
  }
}

/**
 * Fetch all registered users ordered by newest first.
 */
export async function getAllUsers() {
  if (!sql) return [];
  try {
    const rows = await sql`
      SELECT id, name, email, avatar, joined_at as "joinedAt", created_at as "createdAt"
      FROM users
      ORDER BY created_at DESC, joined_at DESC;
    `;
    return rows || [];
  } catch (err) {
    console.error('[Neon DB] Error getting all users:', err);
    return [];
  }
}

/**
 * Find user by email (case-insensitive).
 */
export async function findUserByEmail(email) {
  if (!sql || !email) return null;
  try {
    const norm = email.trim().toLowerCase();
    const rows = await sql`
      SELECT id, name, email, avatar, joined_at as "joinedAt", created_at as "createdAt"
      FROM users
      WHERE LOWER(email) = ${norm}
      LIMIT 1;
    `;
    return rows[0] || null;
  } catch (err) {
    console.error('[Neon DB] Error finding user by email:', err);
    return null;
  }
}

/**
 * Upsert user: permanently store every new user and their email in Neon.
 * Returns { user, isNew }.
 */
export async function upsertUser({ name, email, avatar }) {
  if (!sql || !email) return { user: null, isNew: false };
  const normEmail = email.trim().toLowerCase();
  const cleanName = name && name.trim() ? name.trim() : normEmail.split('@')[0];
  const cleanAvatar = avatar || (cleanName[0] ? cleanName[0].toUpperCase() : 'Z');

  try {
    const existing = await findUserByEmail(normEmail);
    if (existing) {
      // Update name/avatar if new ones provided
      const updated = await sql`
        UPDATE users
        SET name = COALESCE(${cleanName}, name),
            avatar = COALESCE(${cleanAvatar}, avatar)
        WHERE LOWER(email) = ${normEmail}
        RETURNING id, name, email, avatar, joined_at as "joinedAt", created_at as "createdAt";
      `;
      return { user: updated[0] || existing, isNew: false };
    }

    // Insert new user
    const id = `usr-${Date.now()}`;
    const joinedAt = new Date().toISOString();
    const inserted = await sql`
      INSERT INTO users (id, name, email, avatar, joined_at)
      VALUES (${id}, ${cleanName}, ${normEmail}, ${cleanAvatar}, ${joinedAt})
      RETURNING id, name, email, avatar, joined_at as "joinedAt", created_at as "createdAt";
    `;
    console.log(`[Neon DB] Permanently saved new user: ${cleanName} (${normEmail})`);
    return { user: inserted[0], isNew: true };
  } catch (err) {
    console.error('[Neon DB] Error in upsertUser:', err);
    return {
      user: {
        id: `usr-${Date.now()}`,
        name: cleanName,
        email: normEmail,
        avatar: cleanAvatar,
        joinedAt: new Date().toISOString()
      },
      isNew: false
    };
  }
}

/**
 * Fetch all prayer requests ordered by newest first.
 */
export async function getAllPrayers() {
  if (!sql) return [];
  try {
    const rows = await sql`
      SELECT id, name, email, category, prayer_points as "prayerPoints", 
             is_private as "isPrivate", submitted_at as "submittedAt", formatted_date as "formattedDate",
             created_at as "createdAt"
      FROM prayer_requests
      ORDER BY created_at DESC, submitted_at DESC;
    `;
    return rows || [];
  } catch (err) {
    console.error('[Neon DB] Error getting all prayers:', err);
    return [];
  }
}

/**
 * Permanently insert a new prayer request in Neon.
 */
export async function insertPrayerRequest(prayer) {
  if (!sql) return null;
  try {
    const id = prayer.id || `prayer-${Date.now()}`;
    const name = prayer.name.trim();
    const email = prayer.email.trim().toLowerCase();
    const category = prayer.category || 'General Support';
    const prayerPoints = prayer.prayerPoints.trim();
    const isPrivate = !!prayer.isPrivate;
    const submittedAt = prayer.submittedAt || new Date().toISOString();
    const formattedDate = prayer.formattedDate || new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const inserted = await sql`
      INSERT INTO prayer_requests (id, name, email, category, prayer_points, is_private, submitted_at, formatted_date)
      VALUES (${id}, ${name}, ${email}, ${category}, ${prayerPoints}, ${isPrivate}, ${submittedAt}, ${formattedDate})
      RETURNING id, name, email, category, prayer_points as "prayerPoints", 
                is_private as "isPrivate", submitted_at as "submittedAt", formatted_date as "formattedDate";
    `;

    console.log(`[Neon DB] Permanently saved prayer request from: ${name} (${email})`);
    return inserted[0];
  } catch (err) {
    console.error('[Neon DB] Error inserting prayer request:', err);
    return null;
  }
}

/**
 * Fetch all unique registered emails across users and prayer requests for broadcasting.
 */
export async function getAllEmailRecipients() {
  if (!sql) return [];
  try {
    const rows = await sql`
      SELECT DISTINCT LOWER(TRIM(email)) as email
      FROM (
        SELECT email FROM users
        UNION
        SELECT email FROM prayer_requests
      ) combined
      WHERE email IS NOT NULL AND email LIKE '%@%' AND email LIKE '%.%';
    `;
    return rows.map(r => r.email).filter(Boolean);
  } catch (err) {
    console.error('[Neon DB] Error fetching email recipients:', err);
    return [];
  }
}

/**
 * Save persistent app setting (e.g. daily verse, reflections, mail config).
 */
export async function setAppSetting(key, value) {
  if (!sql) return false;
  try {
    const valString = typeof value === 'string' ? value : JSON.stringify(value);
    await sql`
      INSERT INTO app_settings (key, value, updated_at)
      VALUES (${key}, ${valString}, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW();
    `;
    return true;
  } catch (err) {
    console.error(`[Neon DB] Error saving app setting ${key}:`, err);
    return false;
  }
}

/**
 * Retrieve persistent app setting.
 */
export async function getAppSetting(key) {
  if (!sql) return null;
  try {
    const rows = await sql`
      SELECT value FROM app_settings WHERE key = ${key} LIMIT 1;
    `;
    if (rows && rows[0]) {
      try {
        return JSON.parse(rows[0].value);
      } catch {
        return rows[0].value;
      }
    }
    return null;
  } catch (err) {
    console.error(`[Neon DB] Error getting app setting ${key}:`, err);
    return null;
  }
}
