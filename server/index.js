import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const app = express();
app.use(cors());
app.use(express.json());

// ============================================================
// NEON POSTGRESQL POOL
// ============================================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

console.log('--- Konfigurasi Server ---');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Ada (Neon DB)' : '❌ Kosong');
console.log('GMAIL_USER:', process.env.GMAIL_USER || '❌ Kosong');
console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ Ada' : '❌ Kosong');
console.log('--------------------------');

// Ensure tables/defaults exist on startup
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.lamps (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(50) UNIQUE NOT NULL,
        lamp1_on BOOLEAN DEFAULT false,
        lamp2_on BOOLEAN DEFAULT false,
        lamp3_on BOOLEAN DEFAULT false,
        lamp4_on BOOLEAN DEFAULT false,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS public.doors (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(50) UNIQUE NOT NULL,
        is_locked BOOLEAN DEFAULT true,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS public.rfid_cards (
        id SERIAL PRIMARY KEY,
        card_uid VARCHAR(50) UNIQUE NOT NULL,
        holder_name VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS public.access_logs (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(50) NOT NULL,
        card_uid VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        method VARCHAR(20) DEFAULT 'RFID',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO public.lamps (device_id, lamp1_on, lamp2_on, lamp3_on, lamp4_on)
      VALUES ('LAMPU-001', false, false, false, false)
      ON CONFLICT (device_id) DO NOTHING;

      INSERT INTO public.doors (device_id, is_locked)
      VALUES ('DOOR-001', true)
      ON CONFLICT (device_id) DO NOTHING;

      INSERT INTO public.rfid_cards (card_uid, holder_name, is_active)
      VALUES ('A1B2C3D4', 'Admin / Master Card', true), ('E5F6G7H8', 'User Utama', true)
      ON CONFLICT (card_uid) DO NOTHING;
    `);
    console.log('✅ Inisialisasi Database Neon Postgres Berhasil!');
  } catch (err) {
    console.error('❌ Gagal Inisialisasi Database:', err.message);
  }
}
initDb();

// ============================================================
// GMAIL SMTP TRANSPORTER
// ============================================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ SMTP Error:', error.message);
  } else {
    console.log('✅ Gmail SMTP terhubung!');
  }
});

// ============================================================
// API: LAMPU (public.lamps)
// ============================================================

// GET lamps state
app.get('/api/lamps', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM public.lamps WHERE device_id = 'LAMPU-001' LIMIT 1");
    if (rows.length === 0) {
      const insert = await pool.query(
        "INSERT INTO public.lamps (device_id, lamp1_on, lamp2_on, lamp3_on, lamp4_on) VALUES ('LAMPU-001', false, false, false, false) RETURNING *"
      );
      return res.json({ success: true, data: insert.rows[0] });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST toggle single lamp channel (lamp1_on..lamp4_on)
app.post('/api/lamps/toggle', async (req, res) => {
  const { lampKey, status } = req.body; // e.g. lampKey = 'lamp1_on', status = true
  const validKeys = ['lamp1_on', 'lamp2_on', 'lamp3_on', 'lamp4_on'];

  if (!validKeys.includes(lampKey)) {
    return res.status(400).json({ success: false, message: 'Invalid lampKey parameter' });
  }

  try {
    const query = `
      UPDATE public.lamps
      SET ${lampKey} = $1, updated_at = CURRENT_TIMESTAMP
      WHERE device_id = 'LAMPU-001'
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [status]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST turn off all lamps
app.post('/api/lamps/off-all', async (req, res) => {
  try {
    const query = `
      UPDATE public.lamps
      SET lamp1_on = false, lamp2_on = false, lamp3_on = false, lamp4_on = false, updated_at = CURRENT_TIMESTAMP
      WHERE device_id = 'LAMPU-001'
      RETURNING *;
    `;
    const { rows } = await pool.query(query);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// API: PINTU (public.doors)
// ============================================================

// GET door status
app.get('/api/doors', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM public.doors WHERE device_id = 'DOOR-001' LIMIT 1");
    if (rows.length === 0) {
      const insert = await pool.query(
        "INSERT INTO public.doors (device_id, is_locked) VALUES ('DOOR-001', true) RETURNING *"
      );
      return res.json({ success: true, data: insert.rows[0] });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST toggle door status (is_locked)
app.post('/api/doors/toggle', async (req, res) => {
  const { is_locked, card_uid = 'WEB_APP', method = 'WEB_APP' } = req.body;
  const targetLocked = !!is_locked;

  try {
    // 1. Update door state
    const updateRes = await pool.query(
      "UPDATE public.doors SET is_locked = $1, updated_at = CURRENT_TIMESTAMP WHERE device_id = 'DOOR-001' RETURNING *",
      [targetLocked]
    );

    // 2. Add log entry
    await pool.query(
      "INSERT INTO public.access_logs (device_id, card_uid, status, method) VALUES ('DOOR-001', $1, 'GRANTED', $2)",
      [card_uid, method]
    );

    res.json({ success: true, data: updateRes.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// API: ACCESS LOGS (public.access_logs)
// ============================================================
app.get('/api/access-logs', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM public.access_logs ORDER BY created_at DESC LIMIT 20");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// API: RFID CARDS (public.rfid_cards)
// ============================================================
app.get('/api/rfid-cards', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM public.rfid_cards ORDER BY created_at ASC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// TEST ENDPOINT
// ============================================================
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server Neon DB Express berjalan lancar!' });
});

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Server Express berjalan di http://localhost:${PORT}`);
  console.log(`📋 Test API: http://localhost:${PORT}/api/test`);
});

