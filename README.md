# virex-web

A pnpm/Turborepo monorepo powering the Virex group's public sites.

## Structure

```
apps/
  web/
    capital/            Next.js site — Virex Capital
    holding/            Next.js site — Virex Holding
    structure-builder/  Next.js app — Virex Structure Builder
  service/
    api/                NestJS API service
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


holiding company -> de holding company is een company die andere companies bezit. in dit geval is dit virex holding B.V. en deze is eigenaar van Qorve, vantigo, virex capital. 