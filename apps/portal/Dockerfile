# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
RUN npm install -g pnpm@9.10.0

# ── deps ──────────────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ packages/
COPY apps/portal/package.json apps/portal/package.json
RUN pnpm install --frozen-lockfile

# ── build ─────────────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY apps/portal/ apps/portal/
# Build-time env (public vars only)
ARG NEXT_PUBLIC_QORVE_MERCHANT_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_QORVE_CHECKOUT_URL
ARG NEXT_PUBLIC_QORVE_API_URL
ENV NEXT_PUBLIC_QORVE_MERCHANT_PUBLISHABLE_KEY=$NEXT_PUBLIC_QORVE_MERCHANT_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_QORVE_CHECKOUT_URL=$NEXT_PUBLIC_QORVE_CHECKOUT_URL
ENV NEXT_PUBLIC_QORVE_API_URL=$NEXT_PUBLIC_QORVE_API_URL
RUN pnpm --filter portal build

# ── runner ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/portal/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/.next/static ./.next/static

USER nextjs
EXPOSE 3203
ENV PORT=3203
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
