# 🚀 Guía de Deployment - Sistema de Licencias MPD

## 📋 **Resumen de Deployment**

El Sistema de Licencias MPD está completamente preparado para deployment en producción con configuraciones optimizadas para Docker, Kubernetes y CI/CD automatizado.

## 🐳 **Deployment con Docker**

### 🚀 **Quick Start**
```bash
# Clonar repositorio
git clone https://github.com/mpd/sistema-licencias.git
cd sistema-licencias

# Configurar variables de entorno
cp .env.production .env

# Editar variables críticas
nano .env

# Ejecutar deployment
./scripts/deploy.sh deploy production
```

### 📦 **Configuración de Contenedores**

#### **Frontend Container**
- **Base Image**: `node:18-alpine`
- **Multi-stage build** optimizado
- **Security**: Usuario no-root (nextjs:1001)
- **Health Check**: `/api/health` endpoint
- **Size**: ~150MB optimizado

#### **Servicios Incluidos**
```yaml
services:
  frontend:     # Next.js Application (Puerto 3000)
  backend:      # API Server (Puerto 3001) - Preparado
  postgres:     # PostgreSQL 15 (Puerto 5432)
  redis:        # Redis Cache (Puerto 6379)
  genkit:       # IA Service (Puerto 4001) - Preparado
  whatsapp:     # WhatsApp API (Puerto 5001) - Preparado
```

### 🔧 **Scripts de Deployment**

#### **Script Principal: `./scripts/deploy.sh`**
```bash
# Deployment completo
./scripts/deploy.sh deploy production

# Solo build
./scripts/deploy.sh build

# Solo tests
./scripts/deploy.sh test

# Health check
./scripts/deploy.sh health

# Rollback
./scripts/deploy.sh rollback

# Ver logs
./scripts/deploy.sh logs

# Estado de servicios
./scripts/deploy.sh status

# Limpieza
./scripts/deploy.sh cleanup
```

## ☸️ **Deployment con Kubernetes**

### 🏗️ **Arquitectura K8s**
```
licencias-mpd namespace
├── frontend-deployment (3 replicas)
├── frontend-service (ClusterIP)
├── frontend-hpa (3-10 replicas)
├── ingress (SSL + Security)
└── network-policy (Security)
```

### 📦 **Manifiestos Incluidos**
- `k8s/namespace.yaml` - Namespace y resource quotas
- `k8s/frontend-deployment.yaml` - Deployment, Service, HPA, PDB
- `k8s/ingress.yaml` - Ingress con SSL y security headers

### 🚀 **Deploy a Kubernetes**
```bash
# Aplicar namespace
kubectl apply -f k8s/namespace.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Configurar ingress
kubectl apply -f k8s/ingress.yaml

# Verificar deployment
kubectl get pods -n licencias-mpd
kubectl get services -n licencias-mpd
kubectl get ingress -n licencias-mpd
```

### 📊 **Configuración de Autoscaling**
- **Min Replicas**: 3
- **Max Replicas**: 10
- **CPU Target**: 70%
- **Memory Target**: 80%
- **Scale Down**: 10% cada 60s (estabilización 5min)
- **Scale Up**: 50% cada 60s (estabilización 1min)

## 🔄 **CI/CD Pipeline**

### 🛠️ **GitHub Actions Workflow**
```yaml
Stages:
  1. 🧪 Testing (Unit, Integration, E2E)
  2. 🔒 Security Scan (Trivy, CodeQL, npm audit)
  3. 🏗️ Build (Multi-arch Docker images)
  4. ⚡ Performance (Lighthouse CI)
  5. 🚀 Deploy Staging (develop branch)
  6. 🚀 Deploy Production (main branch)
  7. 📦 Release Management
  8. 🧹 Cleanup
```

### 🔐 **Secrets Requeridos**
```bash
# GitHub Secrets
GITHUB_TOKEN                 # Para registry
AWS_ACCESS_KEY_ID           # Para AWS deployment
AWS_SECRET_ACCESS_KEY       # Para AWS deployment
SLACK_WEBHOOK               # Para notificaciones
LHCI_GITHUB_APP_TOKEN      # Para Lighthouse CI

# Environment Variables
DB_PASSWORD                 # Base de datos
JWT_SECRET                  # Autenticación
WHATSAPP_BUSINESS_TOKEN    # WhatsApp API
GOOGLE_API_KEY             # IA Genkit
```

## 🔧 **Configuración de Producción**

### 🌐 **Variables de Entorno Críticas**
```bash
# Aplicación
NODE_ENV=production
APP_URL=https://licencias.mpd.gov.ar

# Base de Datos
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379

# Seguridad
JWT_SECRET=secure-random-string-256-bits
SESSION_SECRET=secure-session-secret

# Servicios Externos
ZIMBRA_API_URL=https://mail.mpd.gov.ar/service/soap
WHATSAPP_BUSINESS_TOKEN=your-whatsapp-token
GOOGLE_API_KEY=your-google-api-key
```

### 🔒 **Configuración de Seguridad**
- **SSL/TLS**: Certificados Let's Encrypt automáticos
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Rate Limiting**: 100 req/min por IP
- **CORS**: Configurado para dominio específico
- **Network Policies**: Tráfico restringido entre pods

## 📊 **Monitoreo y Observabilidad**

### 🔍 **Health Checks**
```bash
# Frontend Health Check
curl https://licencias.mpd.gov.ar/api/health

# Detailed Health Check
curl https://licencias.mpd.gov.ar/api/health?detailed=true

# Response Example
{
  "status": "healthy",
  "timestamp": "2024-03-15T14:30:00Z",
  "responseTime": "45ms",
  "application": {
    "name": "Sistema de Licencias MPD",
    "version": "1.7.0",
    "environment": "production"
  },
  "system": {
    "memory": { "heapUsed": 128, "heapTotal": 256 },
    "uptime": 3600,
    "nodeVersion": "v18.19.0"
  },
  "checks": {
    "server": "ok",
    "memory": "ok",
    "uptime": "ok"
  }
}
```

### 📈 **Métricas Disponibles**
- **Application Metrics**: `/api/metrics` (Prometheus format)
- **Performance Metrics**: Core Web Vitals tracking
- **Business Metrics**: Solicitudes, usuarios, performance
- **Infrastructure Metrics**: CPU, memoria, red, storage

### 🚨 **Alertas Configuradas**
- **High CPU Usage**: >80% por 5 minutos
- **High Memory Usage**: >85% por 5 minutos
- **Response Time**: >2s promedio por 5 minutos
- **Error Rate**: >5% por 5 minutos
- **Pod Restarts**: >3 restarts en 10 minutos

## 🔄 **Backup y Recovery**

### 💾 **Estrategia de Backup**
```bash
# Backup automático diario
0 2 * * * /scripts/backup.sh

# Retención
- Diarios: 30 días
- Semanales: 12 semanas
- Mensuales: 12 meses
- Anuales: 7 años
```

### 🔄 **Procedimiento de Recovery**
```bash
# Rollback automático
./scripts/deploy.sh rollback production

# Recovery manual
kubectl rollout undo deployment/licencias-frontend -n licencias-mpd

# Restore de base de datos
docker-compose exec postgres psql -U user -d db < backup.sql
```

## 🌍 **Configuración de Dominios**

### 🌐 **DNS Configuration**
```bash
# Registros DNS requeridos
licencias.mpd.gov.ar     A     IP_ADDRESS
www.licencias.mpd.gov.ar CNAME licencias.mpd.gov.ar
api.licencias.mpd.gov.ar A     API_IP_ADDRESS
```

### 🔒 **SSL Certificates**
- **Proveedor**: Let's Encrypt (cert-manager)
- **Renovación**: Automática cada 60 días
- **Wildcard**: *.licencias.mpd.gov.ar (opcional)
- **HSTS**: Habilitado con preload

## 📋 **Checklist de Deployment**

### ✅ **Pre-Deployment**
- [ ] Variables de entorno configuradas
- [ ] Secrets de producción establecidos
- [ ] DNS configurado correctamente
- [ ] Certificados SSL preparados
- [ ] Backup de datos existentes
- [ ] Tests pasando en CI/CD
- [ ] Performance tests aprobados
- [ ] Security scan sin issues críticos

### ✅ **Durante Deployment**
- [ ] Monitoring activo
- [ ] Health checks funcionando
- [ ] Logs siendo recolectados
- [ ] Métricas siendo enviadas
- [ ] Alertas configuradas
- [ ] Rollback plan preparado

### ✅ **Post-Deployment**
- [ ] Smoke tests ejecutados
- [ ] Performance verificada
- [ ] Funcionalidades críticas probadas
- [ ] Monitoreo estable
- [ ] Documentación actualizada
- [ ] Equipo notificado

## 🆘 **Troubleshooting**

### 🔍 **Problemas Comunes**

#### **Container no inicia**
```bash
# Ver logs
docker-compose logs frontend

# Verificar configuración
docker-compose config

# Verificar recursos
docker stats
```

#### **Health check falla**
```bash
# Verificar endpoint
curl http://localhost:3000/api/health

# Ver logs de aplicación
kubectl logs -f deployment/licencias-frontend -n licencias-mpd

# Verificar recursos
kubectl top pods -n licencias-mpd
```

#### **Performance issues**
```bash
# Verificar métricas
curl http://localhost:3000/api/metrics

# Verificar autoscaling
kubectl get hpa -n licencias-mpd

# Verificar recursos
kubectl describe pod <pod-name> -n licencias-mpd
```

### 📞 **Contactos de Soporte**
- **Sistemas**: sistemas@mpd.gov.ar
- **DevOps**: devops@mpd.gov.ar
- **Emergencias**: +54 261 123-4567

## 🎯 **Próximos Pasos**

### 🔮 **Mejoras Planificadas**
- **Service Mesh**: Istio para microservicios
- **GitOps**: ArgoCD para deployment declarativo
- **Observability**: Jaeger para distributed tracing
- **Chaos Engineering**: Chaos Monkey para resilience testing

### 📈 **Escalabilidad**
- **Multi-region**: Deployment en múltiples regiones
- **CDN**: CloudFlare para assets estáticos
- **Database Sharding**: Para alta concurrencia
- **Caching Layer**: Redis Cluster para cache distribuido

**El sistema está completamente preparado para producción con todas las mejores prácticas de DevOps, seguridad y observabilidad implementadas.** 🚀✨🔧
