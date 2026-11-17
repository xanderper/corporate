# virex-web

A pnpm/Turborepo monorepo powering the Virex group's public sites.

## Structure

```
apps/
  capital/    Next.js site — Virex Capital
  holding/    Next.js site — Virex Holding
  portal/     Next.js app — Virex Portal (login via Qorve)
packages/
  ui/                  shared React components (@virex/ui)
  content/             shared site content/copy (@virex/content)
  config/              multi-tenant/domain routing config (@virex/config)
  eslint-config/        shared ESLint config (@virex/eslint-config)
  typescript-config/    shared tsconfig bases (@virex/typescript-config)
```

## Getting started

```bash
pnpm install
pnpm dev         # runs all apps via turbo
pnpm build       # builds all apps
pnpm lint
pnpm typecheck
```

Each app can also be run individually, e.g. `pnpm --filter capital dev`.
