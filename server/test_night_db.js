import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_CEXLkHA6JqZ8@ep-green-union-atj7ayb6-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

try {
  console.log('--- 1. Querying current lamps table ---');
  let r = await pool.query("SELECT * FROM public.lamps WHERE device_id = 'LAMPU-001'");
  console.log('Current row:', r.rows[0]);

  console.log('\n--- 2. Updating night mode lamps (L1=false, L2=false, L3=true, L4=true) ---');
  await pool.query("UPDATE public.lamps SET lamp1_on=false, lamp2_on=false, lamp3_on=true, lamp4_on=true WHERE device_id='LAMPU-001'");

  r = await pool.query("SELECT * FROM public.lamps WHERE device_id = 'LAMPU-001'");
  console.log('After update row:', r.rows[0]);
} catch (err) {
  console.error('Error:', err.message);
} finally {
  await pool.end();
}
