FROM node:23-alpine AS base

WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN cd backend && pnpm build

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/backend/.next/standalone ./standalone
COPY --from=builder /app/backend/.next/static ./standalone/backend/.next/static
COPY --from=builder /app/backend/public ./standalone/backend/public
COPY --from=builder --chown=nextjs:nodejs /app/backend/prisma ./prisma

RUN mkdir -p /app/.next/standalone/backend/uploads && chown -R nextjs:nodejs /app/.next/standalone/backend/uploads

USER nextjs
EXPOSE 3000
CMD ["node", ".next/standalone/backend/server.js"]
