# 🛠️ Documentación Técnica - Sistema de Licencias MPD

## 🏗️ **Arquitectura del Sistema**

### 📋 **Stack Tecnológico**

#### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS + Custom Components
- **UI Library**: Radix UI + shadcn/ui
- **State Management**: React Hooks + Context API
- **Charts**: Recharts
- **Icons**: Lucide React
- **Testing**: Jest + Testing Library + Playwright

#### **Backend** (Preparado)
- **Runtime**: Node.js 18+ / Java 17+
- **Framework**: Express.js / Spring Boot
- **Database**: PostgreSQL 15+
- **ORM**: Prisma / JPA + Hibernate
- **Authentication**: JWT + OAuth 2.0
- **API**: RESTful + GraphQL (opcional)
- **Cache**: Redis
- **Queue**: Bull/BullMQ

#### **Infrastructure**
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (opcional)
- **CI/CD**: GitHub Actions / GitLab CI
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Cloud**: AWS / Azure / GCP compatible

### 🏛️ **Arquitectura de Aplicación**

#### **Frontend Architecture**
```
frontend/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── solicitudes/      # Feature components
│   ├── empleados/        # Feature components
│   ├── reportes/         # Feature components
│   ├── calendario/       # Feature components
│   ├── ia/               # AI components
│   └── whatsapp/         # WhatsApp components
├── lib/                   # Utilities and services
│   ├── api/              # API clients
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   ├── utils/            # Helper functions
│   └── hooks/            # Custom React hooks
├── docs/                  # Documentation
├── __tests__/            # Test files
└── e2e/                  # E2E tests
```

#### **Component Architecture**
```
Feature-Based Organization:
├── solicitudes/
│   ├── components/       # Feature-specific components
│   ├── hooks/           # Feature-specific hooks
│   ├── types/           # Feature-specific types
│   └── utils/           # Feature-specific utilities
```

### 🔄 **Data Flow Architecture**

#### **State Management Pattern**
```typescript
// Context + Reducer Pattern
interface AppState {
  user: User | null
  solicitudes: Solicitud[]
  empleados: Empleado[]
  loading: boolean
  error: string | null
}

// Actions
type AppAction = 
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_SOLICITUDES'; payload: Solicitud[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
```

#### **API Integration Pattern**
```typescript
// Service Layer
class SolicitudesService {
  static async obtenerSolicitudes(filtros?: FiltrosSolicitudes) {
    // API call with error handling, caching, retry logic
  }
  
  static async crearSolicitud(solicitud: NuevaSolicitud) {
    // Optimistic updates, validation, error handling
  }
}

// Hook Layer
export const useSolicitudes = (filtros?: FiltrosSolicitudes) => {
  // React Query / SWR pattern for data fetching
}
```

## 🔧 **Configuración de Desarrollo**

### 🚀 **Setup Inicial**

#### **Prerrequisitos**
```bash
# Node.js 18+
node --version  # v18.0.0+

# pnpm (package manager)
npm install -g pnpm

# Git
git --version
```

#### **Instalación**
```bash
# Clonar repositorio
git clone https://github.com/mpd/sistema-licencias.git
cd sistema-licencias/frontend

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local

# Iniciar desarrollo
pnpm dev
```

#### **Variables de Entorno**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_GENKIT_URL=http://localhost:4001
NEXT_PUBLIC_WHATSAPP_API_URL=http://localhost:5001

# Database (Backend)
DATABASE_URL=postgresql://user:password@localhost:5432/licencias
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_CLIENT_SECRET=your-oauth-client-secret

# External Services
ZIMBRA_API_URL=https://mail.mpd.gov.ar/api
WHATSAPP_BUSINESS_TOKEN=your-whatsapp-token
```

### 🛠️ **Scripts de Desarrollo**

```bash
# Desarrollo
pnpm dev              # Iniciar servidor de desarrollo
pnpm build            # Build para producción
pnpm start            # Iniciar servidor de producción
pnpm lint             # Linting con ESLint
pnpm type-check       # Verificación de tipos TypeScript

# Testing
pnpm test             # Tests unitarios
pnpm test:watch       # Tests en modo watch
pnpm test:coverage    # Tests con coverage
pnpm test:e2e         # Tests end-to-end
pnpm test:performance # Tests de performance

# Utilidades
pnpm analyze          # Análisis de bundle
pnpm clean            # Limpiar archivos generados
```

## 📚 **Guías de Desarrollo**

### 🎨 **Convenciones de Código**

#### **TypeScript Guidelines**
```typescript
// Interfaces con PascalCase
interface SolicitudLicencia {
  id: string
  empleadoId: string
  tipo: TipoLicencia
  fechaInicio: Date
  fechaFin: Date
}

// Enums con PascalCase
enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA'
}

// Funciones con camelCase
const calcularDiasLicencia = (inicio: Date, fin: Date): number => {
  // Implementation
}

// Componentes con PascalCase
export const FormularioSolicitud: React.FC<Props> = ({ ... }) => {
  // Component implementation
}
```

#### **File Naming Conventions**
```
Components:     PascalCase.tsx     (FormularioSolicitud.tsx)
Hooks:          camelCase.ts       (useSolicitudes.ts)
Utils:          kebab-case.ts      (date-utils.ts)
Types:          kebab-case.ts      (solicitud-types.ts)
Pages:          kebab-case.tsx     (nueva-solicitud.tsx)
```

#### **Import Organization**
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react'

// 2. Third-party libraries
import { format } from 'date-fns'
import { toast } from 'sonner'

// 3. Internal components
import { Button } from '@/components/ui/button'
import { FormularioSolicitud } from '@/components/solicitudes'

// 4. Types and interfaces
import type { Solicitud, Empleado } from '@/lib/types'

// 5. Utils and services
import { SolicitudesService } from '@/lib/services'
import { formatDate } from '@/lib/utils'
```

### 🧩 **Patrones de Componentes**

#### **Component Structure**
```typescript
// components/solicitudes/FormularioSolicitud.tsx
interface FormularioSolicitudProps {
  empleado: Empleado
  onSubmit: (solicitud: NuevaSolicitud) => void
  onCancel: () => void
  initialData?: Partial<NuevaSolicitud>
}

export const FormularioSolicitud: React.FC<FormularioSolicitudProps> = ({
  empleado,
  onSubmit,
  onCancel,
  initialData
}) => {
  // 1. State declarations
  const [formData, setFormData] = useState<FormData>(initialState)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  // 2. Custom hooks
  const { tiposLicencia } = useTiposLicencia()
  const { validateForm } = useFormValidation()

  // 3. Effects
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  // 4. Event handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Implementation
  }

  const handleFieldChange = (field: keyof FormData, value: any) => {
    // Implementation
  }

  // 5. Render helpers
  const renderField = (field: FormField) => {
    // Implementation
  }

  // 6. Main render
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form content */}
    </form>
  )
}
```

#### **Custom Hooks Pattern**
```typescript
// hooks/useSolicitudes.ts
export const useSolicitudes = (filtros?: FiltrosSolicitudes) => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await SolicitudesService.obtenerSolicitudes(filtros)
      setSolicitudes(data.solicitudes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [filtros])

  useEffect(() => {
    fetchSolicitudes()
  }, [fetchSolicitudes])

  const crearSolicitud = useCallback(async (solicitud: NuevaSolicitud) => {
    try {
      const nueva = await SolicitudesService.crearSolicitud(solicitud)
      setSolicitudes(prev => [nueva, ...prev])
      return nueva
    } catch (err) {
      throw err
    }
  }, [])

  return {
    solicitudes,
    loading,
    error,
    refetch: fetchSolicitudes,
    crearSolicitud
  }
}
```

### 🎨 **Styling Guidelines**

#### **Tailwind CSS Patterns**
```typescript
// Utility-first approach with component variants
const buttonVariants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  danger: 'bg-red-600 hover:bg-red-700 text-white'
}

// Responsive design patterns
const responsiveGrid = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'

// Dark mode support
const cardStyles = 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
```

#### **Component Styling**
```typescript
// Use CSS-in-JS for complex animations
const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.2 }
}

// Consistent spacing system
const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem'     // 48px
}
```

## 🧪 **Testing Strategy**

### 🔬 **Testing Pyramid**

#### **Unit Tests (70%)**
```typescript
// __tests__/components/FormularioSolicitud.test.tsx
describe('FormularioSolicitud', () => {
  const mockProps = {
    empleado: mockEmpleado,
    onSubmit: jest.fn(),
    onCancel: jest.fn()
  }

  it('should render form fields correctly', () => {
    render(<FormularioSolicitud {...mockProps} />)
    
    expect(screen.getByLabelText(/tipo de licencia/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fecha de inicio/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/motivo/i)).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<FormularioSolicitud {...mockProps} />)
    
    await user.click(screen.getByRole('button', { name: /enviar/i }))
    
    expect(screen.getByText(/tipo de licencia es requerido/i)).toBeInTheDocument()
  })
})
```

#### **Integration Tests (20%)**
```typescript
// __tests__/integration/solicitudes-flow.test.ts
describe('Solicitudes Integration', () => {
  it('should create solicitud end-to-end', async () => {
    // Mock API responses
    mockAPI.post('/api/solicitudes').reply(201, mockSolicitudCreada)
    
    const { result } = renderHook(() => useSolicitudes())
    
    await act(async () => {
      await result.current.crearSolicitud(mockNuevaSolicitud)
    })
    
    expect(result.current.solicitudes).toContainEqual(mockSolicitudCreada)
  })
})
```

#### **E2E Tests (10%)**
```typescript
// e2e/solicitudes.spec.ts
test('should create new solicitud', async ({ page }) => {
  await page.goto('/dashboard/solicitudes')
  await page.click('text=Nueva Solicitud')
  
  await page.selectOption('[data-testid="tipo-licencia"]', 'Licencia Anual')
  await page.fill('[data-testid="fecha-inicio"]', '2024-04-01')
  await page.fill('[data-testid="fecha-fin"]', '2024-04-05')
  await page.fill('[data-testid="motivo"]', 'Vacaciones familiares')
  
  await page.click('text=Enviar Solicitud')
  
  await expect(page.locator('.toast-success')).toContainText('Solicitud creada')
})
```

### 📊 **Performance Testing**
```typescript
// __tests__/performance/bundle-size.test.ts
describe('Bundle Size', () => {
  it('should not exceed size limits', async () => {
    const stats = await getBundleStats()
    
    expect(stats.totalSize).toBeLessThan(2 * 1024 * 1024) // 2MB
    expect(stats.chunks.vendor).toBeLessThan(800 * 1024)  // 800KB
    expect(stats.chunks.main).toBeLessThan(500 * 1024)    // 500KB
  })
})
```

## 🚀 **Deployment Guide**

### 🐳 **Docker Configuration**

#### **Dockerfile**
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

#### **Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001
    depends_on:
      - backend
      - redis

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/licencias
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=licencias
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### ☁️ **Cloud Deployment**

#### **Kubernetes Manifests**
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: licencias-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: licencias-frontend
  template:
    metadata:
      labels:
        app: licencias-frontend
    spec:
      containers:
      - name: frontend
        image: licencias/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.licencias.mpd.gov.ar"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### 🔄 **CI/CD Pipeline**

#### **GitHub Actions**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test:ci
      - run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push Docker image
        run: |
          docker build -t licencias/frontend:${{ github.sha }} .
          docker push licencias/frontend:${{ github.sha }}
      
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/licencias-frontend \
            frontend=licencias/frontend:${{ github.sha }}
```

## 📊 **Monitoring & Observability**

### 📈 **Application Metrics**
```typescript
// lib/monitoring/metrics.ts
export const trackUserAction = (action: string, metadata?: object) => {
  if (process.env.NODE_ENV === 'production') {
    analytics.track(action, {
      timestamp: new Date().toISOString(),
      userId: getCurrentUser()?.id,
      sessionId: getSessionId(),
      ...metadata
    })
  }
}

export const trackPerformance = (metric: string, value: number) => {
  performance.mark(`${metric}-${value}`)
  
  if (typeof window !== 'undefined' && 'sendBeacon' in navigator) {
    navigator.sendBeacon('/api/metrics', JSON.stringify({
      metric,
      value,
      timestamp: Date.now()
    }))
  }
}
```

### 🚨 **Error Tracking**
```typescript
// lib/monitoring/error-tracking.ts
export const setupErrorTracking = () => {
  window.addEventListener('error', (event) => {
    reportError({
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    reportError({
      message: 'Unhandled Promise Rejection',
      reason: event.reason,
      stack: event.reason?.stack
    })
  })
}
```

**Esta documentación técnica proporciona las bases para el desarrollo, mantenimiento y evolución del Sistema de Gestión de Licencias. Mantén este documento actualizado con cada cambio significativo en la arquitectura o procesos.** 🛠️✨🚀
