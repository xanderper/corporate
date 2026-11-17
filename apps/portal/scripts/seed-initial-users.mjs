import { Pool } from "pg";
import crypto from "crypto";

const pool = new Pool({
  connectionString: "postgresql://postgres:postgres@localhost:5432/virex_portal",
});

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function seed() {
  console.log("Seeding initial Virex users and demo data...");
  const client = await pool.connect();

  try {
    // 1. Primary Administrator (Xander Perlee)
    const adminEmails = ["virexholding1@gmail.com", "xander@virex.group"];
    for (const email of adminEmails) {
      await client.query(`
        INSERT INTO users (id, email, name, status, last_login_at)
        VALUES ('usr_admin_${email.split("@")[0]}', '${email}', 'Xander Perlee', 'ACTIVE', NOW() - INTERVAL '2 minutes')
        ON CONFLICT (email) DO UPDATE
        SET status = 'ACTIVE', updated_at = NOW();
      `);
    }

    // 2. Active Member (Iris Perlee)
    await client.query(`
      INSERT INTO users (id, email, name, status, last_login_at)
      VALUES ('usr_iris_perlee', 'iris@virex.group', 'Iris Perlee', 'ACTIVE', NOW() - INTERVAL '1 day')
      ON CONFLICT (email) DO UPDATE
      SET status = 'ACTIVE', updated_at = NOW();
    `);

    // 3. Invited User (John Doe)
    const johnToken = generateToken();
    const johnHash = hashToken(johnToken);
    await client.query(`
      INSERT INTO users (id, email, name, status)
      VALUES ('usr_john_doe', 'john.doe@example.com', 'John Doe', 'INVITED')
      ON CONFLICT (email) DO UPDATE
      SET status = 'INVITED', updated_at = NOW();
    `);
    await client.query(`
      INSERT INTO invitations (id, email, invited_by, status, token_hash, expires_at)
      VALUES ('inv_john_doe', 'john.doe@example.com', 'Virex Administrator', 'PENDING', '${johnHash}', NOW() + INTERVAL '7 days')
      ON CONFLICT (id) DO UPDATE
      SET token_hash = '${johnHash}', status = 'PENDING', expires_at = NOW() + INTERVAL '7 days';
    `);

    // 4. Suspended User (Jane Smith)
    await client.query(`
      INSERT INTO users (id, email, name, status, last_login_at)
      VALUES ('usr_jane_smith', 'jane.smith@example.com', 'Jane Smith', 'SUSPENDED', NOW() - INTERVAL '15 days')
      ON CONFLICT (email) DO UPDATE
      SET status = 'SUSPENDED', updated_at = NOW();
    `);

    console.log("✓ Initial users seeded successfully!");
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
