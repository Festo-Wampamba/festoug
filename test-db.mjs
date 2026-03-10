import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  console.log('Connecting to', process.env.DATABASE_URL?.substring(0, 30));
  try {
    const sql = postgres(process.env.DATABASE_URL);
    const res = await sql`SELECT count(*) FROM "blog_post" WHERE "blog_post"."is_published" = true`;
    console.log('Query success:', res);
    
    const res2 = await sql`SELECT * FROM "products"`;
    console.log('Products success:', res2);

    await sql.end();
  } catch (err) {
    console.error('Error:', err);
  }
}
check();
