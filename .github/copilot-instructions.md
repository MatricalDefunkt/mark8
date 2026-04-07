# Project Guidelines

## Tooling and Package Management

- Use **Bun** for all package and script operations in this repository.
- Do not use `npm`, `pnpm`, or `yarn` commands in this workspace.
- Preferred command style:
  - install: `bun install`
  - scripts: `bun run <script>`
  - dependency upgrades: `bun update --latest` (when intentionally doing major updates)
- This is an **absolute rule**, not a soft preference.

## Dependency Risk Controls

- Keep Prisma pinned to major version **6** in `packages/db/package.json` (`@prisma/client` and `prisma` as `^6`).
- Do not upgrade Prisma to v7+ unless explicitly requested by the user.

## TypeScript and Configuration

- Maintain strict TypeScript safety; avoid `as any` and `as unknown` unless absolutely unavoidable and documented inline.
- Do **not** silence deprecated compiler options with `ignoreDeprecations`.
- Do **not** introduce deprecated TS config patterns that trigger TS6+ deprecation failures.
- Prefer import aliases for readability, but implement them using **non-deprecated** configuration patterns compatible with current TypeScript.
- Do not reintroduce deprecated `baseUrl`-driven setups.
- Keep configuration compatible with current TypeScript and workspace typecheck.

## Monorepo Conventions

- Repository layout:
  - `apps/web`: Next.js app and dashboard surfaces
  - `apps/worker`: queue/async workflow execution logic
  - `packages/contracts`: shared schemas/types
  - `packages/authz`: RBAC permissions and guards
  - `packages/config`: env parsing and runtime config
  - `packages/db`: Prisma schema/client/seed
- Preserve boundaries: shared logic belongs in `packages/*`, app-specific logic stays in `apps/*`.

## Validation Before Completion

- Before finishing changes, run type checks with `bun run typecheck` from repo root.
- If database models change, keep Prisma schema, generated client flow, and seed scripts aligned.
- Keep `.env.example` synchronized with required runtime variables.
