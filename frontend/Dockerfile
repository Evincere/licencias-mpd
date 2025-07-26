# Multi-stage Dockerfile optimizado para producción
# Sistema de Licencias MPD - Frontend

# ================================
# STAGE 1: Dependencies
# ================================
FROM node:18-alpine AS deps
LABEL stage=deps
LABEL maintainer="MPD Sistemas <sistemas@mpd.gov.ar>"

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalar pnpm globalmente
RUN npm install -g pnpm@latest

# Instalar dependencias de producción y desarrollo
RUN pnpm install --frozen-lockfile

# ================================
# STAGE 2: Builder
# ================================
FROM node:18-alpine AS builder
LABEL stage=builder

WORKDIR /app

# Copiar dependencias desde stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Configurar variables de entorno para build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Instalar pnpm
RUN npm install -g pnpm@latest

# Generar build optimizado
RUN pnpm build

# ================================
# STAGE 3: Runner (Producción)
# ================================
FROM node:18-alpine AS runner
LABEL stage=runner
LABEL version="1.7.0"
LABEL description="Sistema de Licencias MPD - Frontend"

WORKDIR /app

# Configurar variables de entorno
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos públicos
COPY --from=builder /app/public ./public

# Copiar archivos de build con permisos correctos
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Crear directorio para logs
RUN mkdir -p /app/logs && chown nextjs:nodejs /app/logs

# Crear directorio para uploads temporales
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

# Configurar permisos
RUN chown -R nextjs:nodejs /app

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Comando de inicio
CMD ["node", "server.js"]

# ================================
# STAGE 4: Development (Opcional)
# ================================
FROM node:18-alpine AS development
LABEL stage=development

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat git

# Instalar pnpm
RUN npm install -g pnpm@latest

# Copiar archivos de configuración
COPY package.json pnpm-lock.yaml* ./

# Instalar todas las dependencias (incluyendo dev)
RUN pnpm install

# Copiar código fuente
COPY . .

# Configurar variables de entorno para desarrollo
ENV NODE_ENV development
ENV NEXT_TELEMETRY_DISABLED 1

# Exponer puerto para desarrollo
EXPOSE 3000

# Comando para desarrollo con hot reload
CMD ["pnpm", "dev"]

# ================================
# STAGE 5: Testing (Opcional)
# ================================
FROM node:18-alpine AS testing
LABEL stage=testing

WORKDIR /app

# Instalar dependencias del sistema para testing
RUN apk add --no-cache libc6-compat chromium

# Configurar Chromium para Playwright
ENV CHROMIUM_PATH=/usr/bin/chromium-browser
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Instalar pnpm
RUN npm install -g pnpm@latest

# Copiar dependencias desde deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copiar código fuente
COPY . .

# Instalar browsers para Playwright
RUN npx playwright install --with-deps

# Configurar variables de entorno para testing
ENV NODE_ENV test
ENV CI true

# Comando para ejecutar tests
CMD ["pnpm", "test:ci"]
