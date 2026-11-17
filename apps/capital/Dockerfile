# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
RUN npm install -g pnpm@9.10.0

# ── deps ──────────────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ packages/
COPY apps/capital/package.json apps/capital/package.json
RUN pnpm install --frozen-lockfile

# ── build ─────────────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY apps/capital/ apps/capital/
RUN pnpm --filter capital build

# ── runner ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/capital/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/capital/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/capital/.next/static ./.next/static

USER nextjs
EXPOSE 3202
ENV PORT=3202
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
