# Multi-Stage Production Dockerfile for DPS Indirapuram Web Portal & CMS
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies first for optimal layer caching
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build frontend SPA (dist/public), Vercel serverless (api/index.js), and Standalone server (dist/boot.js)
RUN npm run build

# --- Production Runner Stage ---
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application bundles from builder
COPY --from=builder /app/dist ./dist

# Expose HTTP port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/ping').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the unified Node.js server (Frontend SPA + tRPC CMS API + Auto-seeder)
CMD ["node", "dist/boot.js"]
