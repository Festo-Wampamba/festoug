const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function check() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
    `;
    console.log("Tables in public schema:", result.map(r => r.table_name));
  } catch(e) {
    console.error("Error:", e);
  }
}
check();
