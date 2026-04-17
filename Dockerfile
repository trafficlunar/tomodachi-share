FROM node:23-alpine AS base

WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate


# -------------------------
# Install dependencies
# -------------------------
FROM base AS deps

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile


# -------------------------
# Build stage
# -------------------------
FROM base AS builder

WORKDIR /app

COPY --from=deps /app /app

ENV NEXT_TELEMETRY_DISABLED=1

# Build backend workspace
RUN cd backend && pnpm build


# -------------------------
# Production stage
# -------------------------
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Next/Backend output
COPY --from=builder /app/backend/public ./public
COPY --from=builder /app/backend/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/backend/prisma ./prisma

# uploads dir
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/.next/standalone/backend/uploads

USER nextjs

EXPOSE 3000

CMD ["node", ".next/standalone/backend/server.js"]
