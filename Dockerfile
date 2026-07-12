# Multi-stage build producing the minimal `next.config.ts` `output: "standalone"`
# runtime image (ADR-0009). Uses pnpm via corepack to match pnpm-lock.yaml.

FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DATABASE_URL isn't read at build time, but drizzle.config.ts evaluates
# process.env.DATABASE_URL! at import time via `next build`'s type-check
# pass, so a dummy value avoids a spurious failure.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN pnpm build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Uploaded audio files (ADR-0001: local filesystem storage) — mount a
# volume here in production so they survive redeploys.
RUN mkdir -p /app/data/audio && chown -R nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
