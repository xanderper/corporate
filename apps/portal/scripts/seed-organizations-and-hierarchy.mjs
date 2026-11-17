import { Pool } from "pg";

const pool = new Pool({
  connectionString: "postgresql://postgres:postgres@localhost:5432/virex_portal",
});

async function seed() {
  console.log("Seeding Virex Group Registry, Ownership Hierarchy, Memberships & Reports...");
  const client = await pool.connect();

  try {
    // 1. Seed Organizations
    const orgs = [
      {
        id: "org_virex_holding",
        name: "Virex Holding Group",
        legal_name: "Virex Holding Group B.V.",
        slug: "virex-holding",
        type: "HOLDING",
        description: "Ultimate parent investment holding group governing strategic entities and capital allocation.",
        is_public: true,
      },
      {
        id: "org_northgrid",
        name: "Northgrid",
        legal_name: "Northgrid Holding B.V.",
        slug: "northgrid",
        type: "SUBSIDIARY",
        description: "Digital infrastructure and critical cloud networking operator across Nordic and Benelux.",
        is_public: true,
      },
      {
        id: "org_qorve",
        name: "Qorve",
        legal_name: "Qorve Holding B.V.",
        slug: "qorve",
        type: "SUBSIDIARY",
        description: "Financial infrastructure and unified identity/authentication platform for European enterprises.",
        is_public: true,
      },
      {
        id: "org_virex_capital",
        name: "Virex Capital",
        legal_name: "Virex Capital B.V.",
        slug: "virex-capital",
        type: "SUBSIDIARY",
        description: "Permanent capital allocation arm owning majority, direct, and growth portfolio companies.",
        is_public: true,
      },
      {
        id: "org_horizon",
        name: "Horizon Logistics",
        legal_name: "Horizon Logistics B.V.",
        slug: "horizon-logistics",
        type: "PORTFOLIO_COMPANY",
        description: "Cold-chain logistics provider serving pharmaceutical and high-value food sectors across Northern Europe.",
        is_public: true,
      },
      {
        id: "org_aero",
        name: "Aero Systems",
        legal_name: "Aero Systems Engineering Ltd.",
        slug: "aero-systems",
        type: "PORTFOLIO_COMPANY",
        description: "Manufacturer of advanced telemetry and avionics systems for civil aviation.",
        is_public: true,
      },
      {
        id: "org_lumina",
        name: "Lumina Energy",
        legal_name: "Lumina Energy Nordic AB",
        slug: "lumina-energy",
        type: "PORTFOLIO_COMPANY",
        description: "Grid-scale battery storage operator specializing in frequency response markets.",
        is_public: true,
      },
      {
        id: "org_vertex",
        name: "Vertex Analytics",
        legal_name: "Vertex Analytics GmbH",
        slug: "vertex-analytics",
        type: "PORTFOLIO_COMPANY",
        description: "Industrial AI platform optimizing manufacturing throughput for heavy industry.",
        is_public: true,
      },
    ];

    for (const org of orgs) {
      await client.query(`
        INSERT INTO organizations (id, name, legal_name, slug, type, description, is_public, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name, legal_name = EXCLUDED.legal_name, slug = EXCLUDED.slug,
            type = EXCLUDED.type, description = EXCLUDED.description, is_public = EXCLUDED.is_public;
      `, [org.id, org.name, org.legal_name, org.slug, org.type, org.description, org.is_public]);
    }
    console.log(`✓ Seeded ${orgs.length} organizations in Virex Group Registry`);

    // 2. Seed Ownership Relationships
    await client.query("DELETE FROM ownership_relationships");
    const ownerships = [
      {
        id: "own_holding_northgrid",
        owner: "org_virex_holding",
        owned: "org_northgrid",
        pct: 51.00,
        type: "DIRECT",
      },
      {
        id: "own_holding_qorve",
        owner: "org_virex_holding",
        owned: "org_qorve",
        pct: 51.00,
        type: "DIRECT",
      },
      {
        id: "own_qorve_northgrid",
        owner: "org_qorve",
        owned: "org_northgrid",
        pct: 49.00,
        type: "DIRECT",
      },
      {
        id: "own_holding_capital",
        owner: "org_virex_holding",
        owned: "org_virex_capital",
        pct: 100.00,
        type: "DIRECT",
      },
      {
        id: "own_capital_horizon",
        owner: "org_virex_capital",
        owned: "org_horizon",
        pct: 100.00,
        type: "DIRECT",
      },
      {
        id: "own_capital_aero",
        owner: "org_virex_capital",
        owned: "org_aero",
        pct: 65.00,
        type: "MAJORITY",
      },
      {
        id: "own_capital_lumina",
        owner: "org_virex_capital",
        owned: "org_lumina",
        pct: 15.00,
        type: "MINORITY",
      },
      {
        id: "own_capital_vertex",
        owner: "org_virex_capital",
        owned: "org_vertex",
        pct: 25.00,
        type: "VENTURE",
      },
    ];

    for (const rel of ownerships) {
      await client.query(`
        INSERT INTO ownership_relationships (id, owner_organization_id, owned_organization_id, ownership_percentage, relationship_type)
        VALUES ($1, $2, $3, $4, $5);
      `, [rel.id, rel.owner, rel.owned, rel.pct, rel.type]);
    }
    console.log(`✓ Seeded ${ownerships.length} ownership relationships`);

    // 3. Seed Memberships
    const adminUser = (await client.query("SELECT id FROM users WHERE email = 'virexholding1@gmail.com'")).rows[0]?.id || "usr_admin_virexholding1";
    const xanderUser = (await client.query("SELECT id FROM users WHERE email = 'xander@virex.group'")).rows[0]?.id || "usr_admin_xander";
    const irisUser = (await client.query("SELECT id FROM users WHERE email = 'iris@virex.group'")).rows[0]?.id || "usr_iris_perlee";
    const johnUser = (await client.query("SELECT id FROM users WHERE email = 'john.doe@example.com'")).rows[0]?.id || "usr_john_doe";

    const userPairs = [
      { userId: adminUser, orgId: "org_virex_holding", role: "OWNER", title: "Managing Director" },
      { userId: adminUser, orgId: "org_northgrid", role: "DIRECTOR", title: "Board Member" },
      { userId: adminUser, orgId: "org_qorve", role: "DIRECTOR", title: "Board Member" },
      { userId: adminUser, orgId: "org_virex_capital", role: "DIRECTOR", title: "Managing Partner" },
      { userId: adminUser, orgId: "org_horizon", role: "DIRECTOR", title: "Board Representative" },

      { userId: xanderUser, orgId: "org_virex_holding", role: "OWNER", title: "Managing Director" },
      { userId: xanderUser, orgId: "org_northgrid", role: "DIRECTOR", title: "Board Member" },
      { userId: xanderUser, orgId: "org_qorve", role: "DIRECTOR", title: "Board Member" },
      { userId: xanderUser, orgId: "org_virex_capital", role: "DIRECTOR", title: "Managing Partner" },

      { userId: irisUser, orgId: "org_virex_holding", role: "DIRECTOR", title: "Executive Director" },
      { userId: irisUser, orgId: "org_virex_capital", role: "DIRECTOR", title: "Partner" },

      // John Doe ONLY has membership in Northgrid as Finance Manager!
      { userId: johnUser, orgId: "org_northgrid", role: "MANAGER", title: "Finance Manager" },
    ];

    for (const mem of userPairs) {
      const memId = `mem_${mem.userId.slice(-6)}_${mem.orgId.slice(-6)}`;
      await client.query(`
        INSERT INTO memberships (id, user_id, organization_id, role, title, status)
        VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
        ON CONFLICT (user_id, organization_id) DO UPDATE
        SET role = EXCLUDED.role, title = EXCLUDED.title;
      `, [memId, mem.userId, mem.orgId, mem.role, mem.title]);
    }
    console.log(`✓ Seeded ${userPairs.length} memberships`);

    // 4. Seed Company Reports
    await client.query("DELETE FROM company_reports");
    const reports = [
      {
        id: "rep_northgrid_sep26",
        orgId: "org_northgrid",
        title: "September 2026 Monthly Flash Report",
        period: "September 2026",
        status: "APPROVED",
        revenue: 125000,
        expenses: 78000,
        ebitda: 47000,
        cash: 340000,
        headcount: 12,
        projects: 3,
        risks: 2,
        notes: "Uptime reached 99.998% across Stockholm and Amsterdam edge clusters. Power contracts secured at fixed PPA through 2028.",
        submitter: johnUser,
        reviewer: adminUser,
      },
      {
        id: "rep_northgrid_aug26",
        orgId: "org_northgrid",
        title: "August 2026 Monthly Report",
        period: "August 2026",
        status: "APPROVED",
        revenue: 118000,
        expenses: 76000,
        ebitda: 42000,
        cash: 310000,
        headcount: 11,
        projects: 3,
        risks: 1,
        notes: "Commissioning of Helsinki transit hub on schedule.",
        submitter: johnUser,
        reviewer: adminUser,
      },
      {
        id: "rep_qorve_q3_26",
        orgId: "org_qorve",
        title: "Q3 2026 Financial & Operational Telemetry",
        period: "Q3 2026",
        status: "UNDER_REVIEW",
        revenue: 450000,
        expenses: 310000,
        ebitda: 140000,
        cash: 1200000,
        headcount: 24,
        projects: 4,
        risks: 1,
        notes: "Onboarding 6 tier-2 institutional merchants. Widget latency reduced by 35% on edge PoPs.",
        submitter: adminUser,
        reviewer: null,
      },
      {
        id: "rep_horizon_q3_26",
        orgId: "org_horizon",
        title: "Q3 2026 Consolidated Operating Report",
        period: "Q3 2026",
        status: "APPROVED",
        revenue: 2700000,
        expenses: 2150000,
        ebitda: 550000,
        cash: 980000,
        headcount: 85,
        projects: 2,
        risks: 1,
        notes: "Fleet expansion of 14 electric temperature-controlled trailers in Benelux corridor.",
        submitter: adminUser,
        reviewer: adminUser,
      },
    ];

    for (const r of reports) {
      await client.query(`
        INSERT INTO company_reports (
          id, organization_id, title, period, status, revenue, expenses, ebitda, cash,
          headcount, major_projects, risks_count, notes, submitted_by_id, submitted_at,
          reviewed_by_id, reviewed_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);
      `, [
        r.id, r.orgId, r.title, r.period, r.status, r.revenue, r.expenses, r.ebitda, r.cash,
        r.headcount, r.projects, r.risks, r.notes, r.submitter, new Date(), r.reviewer,
        r.status === 'APPROVED' ? new Date() : null
      ]);
    }
    console.log(`✓ Seeded ${reports.length} company reports with full approval workflows`);

    console.log("\n========================================================");
    console.log("VIREX GROUP REGISTRY & MEMBERSHIPS SEEDED SUCCESSFULLY!");
    console.log("========================================================\n");
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
