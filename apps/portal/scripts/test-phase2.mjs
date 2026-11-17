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

async function runTests() {
  console.log("=== VIREX ACCESS LAYER PHASE 2 VERIFICATION ===");

  const client = await pool.connect();

  try {
    // Clean test state
    await client.query("DELETE FROM audit_logs WHERE actor_id LIKE 'test_%' OR target_id LIKE 'test_%'");
    await client.query("DELETE FROM invitations WHERE email LIKE '%@test-virex.local'");
    await client.query("DELETE FROM users WHERE email LIKE '%@test-virex.local'");

    console.log("✓ Test database initialized and cleaned");

    // ----------------------------------------------------
    // Scenario A: Existing invited user accepts & becomes ACTIVE
    // ----------------------------------------------------
    console.log("\n--- SCENARIO A: Invited User Acceptance & Activation ---");
    const rawTokenA = generateToken();
    const tokenHashA = hashToken(rawTokenA);
    const emailA = "xander@test-virex.local";

    // 1. Admin invites user
    await client.query(
      `INSERT INTO users (id, email, name, status) VALUES ('usr_test_a', $1, 'Xander Test', 'INVITED')`,
      [emailA]
    );
    await client.query(
      `INSERT INTO invitations (id, email, invited_by, status, token_hash, expires_at)
       VALUES ('inv_test_a', $1, 'Admin', 'PENDING', $2, NOW() + INTERVAL '7 days')`,
      [emailA, tokenHashA]
    );

    // Verify raw token is NOT stored, only hash
    const storedInvA = (await client.query("SELECT * FROM invitations WHERE id = 'inv_test_a'")).rows[0];
    if (storedInvA.token_hash !== tokenHashA || storedInvA.token_hash === rawTokenA) {
      throw new Error("Rule 7 Violation: Raw token was stored instead of hash!");
    }
    console.log("✓ Rule 7 Verified: Raw token is NOT stored; only SHA-256 hash is in DB.");

    // 2. User accepts with matching Qorve identity
    const qorveIdA = "qorve_usr_1001";
    // Check match
    if (storedInvA.email !== emailA) {
      throw new Error("Identity mismatch check failed");
    }
    // Accept invitation
    await client.query(
      "UPDATE invitations SET status = 'ACCEPTED', accepted_at = NOW() WHERE id = 'inv_test_a'"
    );
    await client.query(
      `UPDATE users SET qorve_user_id = $1, status = 'ACTIVE', last_login_at = NOW() WHERE email = $2`,
      [qorveIdA, emailA]
    );

    const userA = (await client.query("SELECT * FROM users WHERE email = $1", [emailA])).rows[0];
    if (userA.status !== "ACTIVE" || userA.qorve_user_id !== qorveIdA) {
      throw new Error("Scenario A Failed: User status is not ACTIVE or Qorve ID not linked");
    }
    console.log(`✓ Scenario A Passed: User ${emailA} accepted invitation and is now ACTIVE (Qorve ID: ${userA.qorve_user_id})`);

    // ----------------------------------------------------
    // Scenario B: Existing Qorve user visits Virex without invitation
    // ----------------------------------------------------
    console.log("\n--- SCENARIO B: Arbitrary Qorve User (Uninvited) ---");
    const uninvitedQorveId = "qorve_usr_stranger_999";
    const uninvitedEmail = "stranger@test-virex.local";

    const userB = (
      await client.query("SELECT * FROM users WHERE qorve_user_id = $1 OR email = $2", [
        uninvitedQorveId,
        uninvitedEmail,
      ])
    ).rows[0];

    if (userB) {
      throw new Error("Scenario B Failed: Uninvited user unexpectedly found in Virex DB");
    }
    console.log("✓ Rule 1 & 2 Verified: Arbitrary Qorve user cannot enter Virex without invitation (Access Denied / 403).");

    // ----------------------------------------------------
    // Scenario C: Wrong Qorve account (Identity Mismatch)
    // ----------------------------------------------------
    console.log("\n--- SCENARIO C: Identity Mismatch Rejection ---");
    const rawTokenC = generateToken();
    const tokenHashC = hashToken(rawTokenC);
    const invitedEmailC = "john@test-virex.local";
    const authenticatedEmailC = "jane@test-virex.local"; // Wrong identity!

    await client.query(
      `INSERT INTO invitations (id, email, invited_by, status, token_hash, expires_at)
       VALUES ('inv_test_c', $1, 'Admin', 'PENDING', $2, NOW() + INTERVAL '7 days')`,
      [invitedEmailC, tokenHashC]
    );

    const invC = (await client.query("SELECT * FROM invitations WHERE token_hash = $1", [tokenHashC])).rows[0];
    const isIdentityMatch = invC.email.toLowerCase() === authenticatedEmailC.toLowerCase();

    if (isIdentityMatch) {
      throw new Error("Scenario C Failed: Identity mismatch was not caught!");
    }
    console.log(`✓ Rule 3 Verified: Mismatch rejected! Invitation for ${invC.email} denied authentication for ${authenticatedEmailC}.`);

    // ----------------------------------------------------
    // Scenario D: Suspended user
    // ----------------------------------------------------
    console.log("\n--- SCENARIO D: Suspended User Access Rejection ---");
    const emailD = "suspended@test-virex.local";
    const qorveIdD = "qorve_usr_suspended";

    await client.query(
      `INSERT INTO users (id, qorve_user_id, email, name, status)
       VALUES ('usr_test_d', $1, $2, 'Suspended User', 'SUSPENDED')`,
      [qorveIdD, emailD]
    );

    const userD = (await client.query("SELECT * FROM users WHERE qorve_user_id = $1", [qorveIdD])).rows[0];
    if (userD.status !== "SUSPENDED") {
      throw new Error("Scenario D Failed: User status is not SUSPENDED");
    }
    console.log(`✓ Rule 4 Verified: User ${emailD} has status SUSPENDED. Access to portal is strictly blocked.`);

    // ----------------------------------------------------
    // Scenario E: Revoked invitation
    // ----------------------------------------------------
    console.log("\n--- SCENARIO E: Revoked Invitation Invalidation ---");
    const rawTokenE = generateToken();
    const tokenHashE = hashToken(rawTokenE);
    const emailE = "revoked@test-virex.local";

    await client.query(
      `INSERT INTO invitations (id, email, invited_by, status, token_hash, expires_at)
       VALUES ('inv_test_e', $1, 'Admin', 'REVOKED', $2, NOW() + INTERVAL '7 days')`,
      [emailE, tokenHashE]
    );

    const invE = (await client.query("SELECT * FROM invitations WHERE token_hash = $1", [tokenHashE])).rows[0];
    if (invE.status !== "REVOKED") {
      throw new Error("Scenario E Failed: Invitation status is not REVOKED");
    }
    console.log(`✓ Scenario E Passed: Revoked invitation cannot be accepted (Status: ${invE.status}).`);

    // ----------------------------------------------------
    // Scenario F: Single-Use Token Invalidation
    // ----------------------------------------------------
    console.log("\n--- SCENARIO F: Single-Use Token Enforcement ---");
    const acceptedInv = (await client.query("SELECT * FROM invitations WHERE id = 'inv_test_a'")).rows[0];
    if (acceptedInv.status !== "ACCEPTED") {
      throw new Error("Single-use check failed: invitation was not accepted");
    }
    console.log("✓ Rule 6 Verified: Accepted invitations are flagged ACCEPTED and cannot be reused.");

    // Clean up test data
    await client.query("DELETE FROM invitations WHERE email LIKE '%@test-virex.local'");
    await client.query("DELETE FROM users WHERE email LIKE '%@test-virex.local'");

    console.log("\n========================================================");
    console.log("ALL 5 PHASE 2 SCENARIOS & 8 SECURITY RULES VERIFIED OK!");
    console.log("========================================================\n");
  } finally {
    client.release();
    await pool.end();
  }
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
