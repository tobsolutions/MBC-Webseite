# syntax=docker/dockerfile:1

##########
# 1. Basis mit pnpm
##########
FROM node:20-alpine AS base
# libc6-compat wird von einigen Node-Modulen unter Alpine benoetigt
RUN apk add --no-cache libc6-compat
# pnpm via corepack aktivieren
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

##########
# 2. Abhaengigkeiten installieren (nur wenn sich Lockfile/Manifest aendern -> Cache)
##########
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

##########
# 3. Anwendung bauen
##########
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Telemetrie abschalten und Produktions-Build erzeugen
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

##########
# 4. Schlankes Runtime-Image
##########
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Standard-Port; kann beim Start ueberschrieben werden
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Nicht als root laufen (Sicherheit)
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Oeffentliche Assets
COPY --from=builder /app/public ./public

# Standalone-Server + statische Dateien aus dem Build kopieren
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Der standalone-Build enthaelt einen eigenen Server unter server.js
CMD ["node", "server.js"]
