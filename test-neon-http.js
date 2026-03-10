const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function check() {
  const url = process.env.DATABASE_URL.replace("-pooler", "");
  console.log("Using URL:", url.substring(0, 50));
  const sql = neon(url);
  try {
    const res1 = await sql`SELECT count(*) FROM "blog_post" WHERE "is_published" = true`;
    console.log("Blog Post count:", res1);
    
    const res2 = await sql`SELECT count(*) FROM "product"`;
    console.log("Product count:", res2);
  } catch(e) {
    console.error("Neon HTTP Error:", e);
  }
}
check();
