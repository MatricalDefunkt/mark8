FROM oven/bun:1.3.9 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock bunfig.toml tsconfig.base.json turbo.json .env.example ./
COPY apps/web/package.json apps/web/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/authz/package.json packages/authz/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/db/package.json packages/db/package.json
RUN bun install --frozen-lockfile

FROM deps AS build
COPY . .
RUN bun run --filter @mark8/worker build

FROM oven/bun:1.3.9 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app .
CMD ["bun", "run", "--filter", "@mark8/worker", "start"]
