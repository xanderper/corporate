# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
RUN npm install -g pnpm@9.10.0

# ── deps ──────────────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ packages/
COPY apps/service/api/package.json apps/service/api/package.json
RUN pnpm install --frozen-lockfile

# ── build ─────────────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY apps/service/api/ apps/service/api/
RUN pnpm --filter api build

# ── runner ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/service/api/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/service/api/node_modules ./apps/service/api/node_modules

EXPOSE 3201
CMD ["node", "dist/main"]
