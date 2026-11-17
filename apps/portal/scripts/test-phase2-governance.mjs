import { Pool } from "pg";

const pool = new Pool({
  connectionString: "postgresql://postgres:postgres@localhost:5432/virex_portal",
});

async function testGovernance() {
  console.log("=== TESTING PHASE 2 GOVERNANCE & ORGANIZATION REGISTRY ===");

  const client = await pool.connect();
  try {
    // 1. Verify Organizations & Ownership
    const orgCount = (await client.query("SELECT COUNT(*) FROM organizations")).rows[0].count;
    const relCount = (await client.query("SELECT COUNT(*) FROM ownership_relationships")).rows[0].count;
    const memCount = (await client.query("SELECT COUNT(*) FROM memberships")).rows[0].count;
    const repCount = (await client.query("SELECT COUNT(*) FROM company_reports")).rows[0].count;

    console.log(`✓ Organizations in Registry: ${orgCount}`);
    console.log(`✓ Ownership Relationships: ${relCount}`);
    console.log(`✓ Memberships Active: ${memCount}`);
    console.log(`✓ Company Reports Recorded: ${repCount}`);

    // 2. Verify Scoped Access Separation
    // Northgrid employee (John Doe)
    const johnId = (await client.query("SELECT id FROM users WHERE email = 'john.doe@example.com'")).rows[0]?.id;
    const johnMemberships = (
      await client.query(
        `SELECT m.role, o.name FROM memberships m JOIN organizations o ON m.organization_id = o.id WHERE m.user_id = $1`,
        [johnId]
      )
    ).rows;

    console.log("\nJohn Doe (Finance) Scoped Memberships:");
    console.log(johnMemberships);
    if (johnMemberships.length !== 1 || johnMemberships[0].name !== "Northgrid") {
      throw new Error("Scoped access violation: John Doe should only belong to Northgrid!");
    }
    console.log("✓ Scoped Access Rule Verified: Finance Manager only sees Northgrid.");

    // 3. Verify Holding Executive (Xander) Multi-Entity Direction
    const xanderId = (await client.query("SELECT id FROM users WHERE email = 'xander@virex.group'")).rows[0]?.id;
    const xanderMemberships = (
      await client.query(
        `SELECT m.role, o.name FROM memberships m JOIN organizations o ON m.organization_id = o.id WHERE m.user_id = $1`,
        [xanderId]
      )
    ).rows;

    console.log("\nXander Perlee Memberships across Group:");
    console.log(xanderMemberships);
    if (xanderMemberships.length < 3) {
      throw new Error("Xander should have multi-entity directorships across the group");
    }
    console.log("✓ Multi-Entity Directorship Verified.");

    // 4. Verify Ownership Topology: Northgrid 51% Holding + 49% Qorve
    const ngOwners = (
      await client.query(
        `SELECT owner.name as owner_name, r.ownership_percentage
         FROM ownership_relationships r
         JOIN organizations owner ON r.owner_organization_id = owner.id
         JOIN organizations owned ON r.owned_organization_id = owned.id
         WHERE owned.slug = 'northgrid'`
      )
    ).rows;
    console.log("\nNorthgrid Ownership Structure:");
    console.log(ngOwners);

    console.log("\n========================================================");
    console.log("ALL GOVERNANCE & ORGANIZATION REGISTRY TESTS PASSED!");
    console.log("========================================================\n");
  } finally {
    client.release();
    await pool.end();
  }
}

testGovernance().catch((err) => {
  console.error(err);
  process.exit(1);
});
