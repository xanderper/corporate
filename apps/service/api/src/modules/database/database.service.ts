import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as crypto from "crypto";
import * as schema from "../../database/schema";

export type DrizzleDB = NodePgDatabase<typeof schema>;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;
  public readonly db: DrizzleDB;

  constructor(private readonly configService: ConfigService) {
    // Pool is created here so `db` can be wired synchronously before NestJS DI resolves.
    const connectionString =
      this.configService.get<string>("DATABASE_URL") ??
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/virex_portal";

    this.pool = new Pool({ connectionString });
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleInit() {
    await this.ensureSchema();
    this.logger.log("Database ready — Drizzle ORM initialized.");
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  generateId(prefix: string): string {
    return `${prefix}_${crypto.randomBytes(12).toString("hex")}`;
  }

  // ─── Schema Bootstrap ─────────────────────────────────────────────────────
  // Drizzle doesn't auto-run migrations in dev; we keep a lightweight
  // CREATE TABLE IF NOT EXISTS block here only for the first-run convenience.
  // In production, use `drizzle-kit migrate`.

  private async ensureSchema() {
    await this.db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        qorve_user_id VARCHAR(128) UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        status VARCHAR(32) NOT NULL DEFAULT 'INVITED',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_login_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS invitations (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        invited_by VARCHAR(255) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
        token_hash VARCHAR(256) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        accepted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        actor_id VARCHAR(255) NOT NULL,
        action VARCHAR(64) NOT NULL,
        target_id VARCHAR(255),
        details JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        legal_name VARCHAR(255) NOT NULL,
        slug VARCHAR(128) NOT NULL UNIQUE,
        type VARCHAR(64) NOT NULL DEFAULT 'SUBSIDIARY',
        description TEXT,
        logo_url TEXT,
        status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
        is_public BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ownership_relationships (
        id VARCHAR(64) PRIMARY KEY,
        owner_organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        owned_organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        ownership_percentage NUMERIC(5, 2) NOT NULL,
        relationship_type VARCHAR(64) NOT NULL DEFAULT 'DIRECT',
        effective_from DATE DEFAULT CURRENT_DATE,
        effective_until DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS memberships (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        role VARCHAR(64) NOT NULL DEFAULT 'MEMBER',
        title VARCHAR(128),
        status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, organization_id)
      );

      CREATE TABLE IF NOT EXISTS company_reports (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        period VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
        revenue NUMERIC(14, 2) DEFAULT 0,
        expenses NUMERIC(14, 2) DEFAULT 0,
        ebitda NUMERIC(14, 2) DEFAULT 0,
        cash NUMERIC(14, 2) DEFAULT 0,
        headcount INTEGER DEFAULT 0,
        major_projects INTEGER DEFAULT 0,
        risks_count INTEGER DEFAULT 0,
        notes TEXT,
        submitted_by_id VARCHAR(64) REFERENCES users(id),
        submitted_at TIMESTAMPTZ,
        reviewed_by_id VARCHAR(64) REFERENCES users(id),
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS files (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        uploader_user_id VARCHAR(64) NOT NULL REFERENCES users(id),
        file_name VARCHAR(255) NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(128) NOT NULL,
        s3_key VARCHAR(512) NOT NULL UNIQUE,
        bucket_name VARCHAR(128) NOT NULL,
        category VARCHAR(64) NOT NULL DEFAULT 'GENERAL',
        is_archived BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_users_qorve_id ON users(qorve_user_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_invitations_token_hash ON invitations(token_hash);
      CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
      CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
      CREATE INDEX IF NOT EXISTS idx_memberships_org ON memberships(organization_id);
      CREATE INDEX IF NOT EXISTS idx_ownership_owner ON ownership_relationships(owner_organization_id);
      CREATE INDEX IF NOT EXISTS idx_ownership_owned ON ownership_relationships(owned_organization_id);
      CREATE INDEX IF NOT EXISTS idx_reports_org ON company_reports(organization_id);
      CREATE INDEX IF NOT EXISTS idx_files_org ON files(organization_id);
    `);
  }
}
