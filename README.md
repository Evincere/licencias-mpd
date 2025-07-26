# 🏛️ Sistema de Licencias MPD
## Ministerio Público de la Defensa - Mendoza

Sistema integral para gestión automatizada de solicitudes de licencia con IA y procesamiento multicanal (Email + WhatsApp).

## 🏗️ Arquitectura

```
Frontend (Next.js) → API REST → Genkit Flows → Backend (Node.js + PostgreSQL)
                           ↑
WhatsApp Business API → Bot Conversacional → Procesamiento IA
```

## 📁 Estructura del Proyecto

- **`backend/`** - Sistema backend completo con 16 flows de Genkit
- **`api-layer/`** - API REST con autenticación JWT y integración WhatsApp ✅
- **`frontend/`** - Interfaz web administrativa (React + Next.js) 🚧
- **`TASKS.md`** - Roadmap detallado de implementación

## 🚀 Inicio Rápido

```bash
# Backend (ya funcional)
cd backend
pnpm install
pnpm dev

# API Layer (recién implementado)
cd api-layer
pnpm install
pnpm run migrate
pnpm dev

# Frontend (próximo a implementar)
cd frontend
pnpm install
pnpm dev
```

## 📊 Estado Actual

- ✅ **Backend**: 100% funcional con IA y base de datos
- ✅ **API Layer**: 100% implementado con autenticación JWT y WhatsApp
- ✅ **Frontend Base**: 100% completado con diseño glassmorphism ✨
- 🚧 **Frontend Páginas**: 30% implementado (empleados, solicitudes pendientes)
- ✅ **WhatsApp**: Base implementada, pendiente configuración externa