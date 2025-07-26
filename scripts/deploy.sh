#!/bin/bash

# ================================
# SCRIPT DE DEPLOYMENT
# Sistema de Licencias MPD
# ================================

set -e  # Exit on any error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT=${1:-production}
VERSION=${2:-latest}

# Funciones de utilidad
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para verificar prerrequisitos
check_prerequisites() {
    log_info "Verificando prerrequisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado"
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose no está instalado"
        exit 1
    fi
    
    # Verificar Git
    if ! command -v git &> /dev/null; then
        log_error "Git no está instalado"
        exit 1
    fi
    
    log_success "Prerrequisitos verificados"
}

# Función para verificar variables de entorno
check_environment() {
    log_info "Verificando configuración de entorno..."
    
    ENV_FILE=".env.${ENVIRONMENT}"
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Archivo de entorno $ENV_FILE no encontrado"
        exit 1
    fi
    
    # Verificar variables críticas
    source "$ENV_FILE"
    
    if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" = "CHANGE_THIS_PASSWORD" ]; then
        log_error "DB_PASSWORD no está configurada correctamente"
        exit 1
    fi
    
    if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "CHANGE_THIS_JWT_SECRET_TO_SECURE_RANDOM_STRING" ]; then
        log_error "JWT_SECRET no está configurada correctamente"
        exit 1
    fi
    
    log_success "Configuración de entorno verificada"
}

# Función para crear backup
create_backup() {
    log_info "Creando backup de la base de datos..."
    
    BACKUP_DIR="./backups"
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    mkdir -p "$BACKUP_DIR"
    
    # Crear backup de PostgreSQL
    docker-compose exec -T postgres pg_dump -U licencias_user licencias_db > "$BACKUP_DIR/$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        log_success "Backup creado: $BACKUP_DIR/$BACKUP_FILE"
    else
        log_warning "No se pudo crear backup (posiblemente primera instalación)"
    fi
}

# Función para construir imágenes
build_images() {
    log_info "Construyendo imágenes Docker..."
    
    # Construir frontend
    log_info "Construyendo imagen del frontend..."
    docker-compose build frontend
    
    # Construir backend (cuando esté disponible)
    if [ -d "./backend" ]; then
        log_info "Construyendo imagen del backend..."
        docker-compose build backend
    fi
    
    log_success "Imágenes construidas exitosamente"
}

# Función para ejecutar tests
run_tests() {
    log_info "Ejecutando tests..."
    
    # Tests del frontend
    cd frontend
    npm run test:ci
    
    if [ $? -ne 0 ]; then
        log_error "Tests fallaron"
        exit 1
    fi
    
    cd ..
    log_success "Tests ejecutados exitosamente"
}

# Función para deployment
deploy() {
    log_info "Iniciando deployment..."
    
    # Detener servicios existentes
    log_info "Deteniendo servicios existentes..."
    docker-compose down
    
    # Limpiar imágenes antiguas
    log_info "Limpiando imágenes antiguas..."
    docker system prune -f
    
    # Iniciar servicios
    log_info "Iniciando servicios..."
    docker-compose --env-file ".env.${ENVIRONMENT}" up -d
    
    # Esperar a que los servicios estén listos
    log_info "Esperando a que los servicios estén listos..."
    sleep 30
    
    # Verificar health checks
    check_health
    
    log_success "Deployment completado exitosamente"
}

# Función para verificar health checks
check_health() {
    log_info "Verificando estado de los servicios..."
    
    # Verificar frontend
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        log_success "Frontend: OK"
    else
        log_error "Frontend: FAIL"
        return 1
    fi
    
    # Verificar backend (cuando esté disponible)
    if curl -f http://localhost:3001/api/health &> /dev/null; then
        log_success "Backend: OK"
    else
        log_warning "Backend: No disponible"
    fi
    
    # Verificar PostgreSQL
    if docker-compose exec -T postgres pg_isready -U licencias_user &> /dev/null; then
        log_success "PostgreSQL: OK"
    else
        log_error "PostgreSQL: FAIL"
        return 1
    fi
    
    # Verificar Redis
    if docker-compose exec -T redis redis-cli ping &> /dev/null; then
        log_success "Redis: OK"
    else
        log_error "Redis: FAIL"
        return 1
    fi
}

# Función para rollback
rollback() {
    log_warning "Iniciando rollback..."
    
    # Detener servicios actuales
    docker-compose down
    
    # Restaurar desde backup más reciente
    LATEST_BACKUP=$(ls -t ./backups/*.sql | head -n1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        log_info "Restaurando desde: $LATEST_BACKUP"
        
        # Iniciar solo PostgreSQL
        docker-compose up -d postgres
        sleep 10
        
        # Restaurar backup
        docker-compose exec -T postgres psql -U licencias_user -d licencias_db < "$LATEST_BACKUP"
        
        # Iniciar todos los servicios
        docker-compose up -d
        
        log_success "Rollback completado"
    else
        log_error "No se encontraron backups para rollback"
        exit 1
    fi
}

# Función para mostrar logs
show_logs() {
    log_info "Mostrando logs de los servicios..."
    docker-compose logs -f --tail=100
}

# Función para mostrar estado
show_status() {
    log_info "Estado de los servicios:"
    docker-compose ps
    
    echo ""
    log_info "Uso de recursos:"
    docker stats --no-stream
}

# Función para limpiar
cleanup() {
    log_info "Limpiando recursos..."
    
    # Detener servicios
    docker-compose down
    
    # Limpiar imágenes no utilizadas
    docker image prune -f
    
    # Limpiar volúmenes no utilizados
    docker volume prune -f
    
    log_success "Limpieza completada"
}

# Función de ayuda
show_help() {
    echo "Script de Deployment - Sistema de Licencias MPD"
    echo ""
    echo "Uso: $0 [COMANDO] [ENTORNO] [VERSION]"
    echo ""
    echo "Comandos:"
    echo "  deploy     - Ejecutar deployment completo (default)"
    echo "  build      - Solo construir imágenes"
    echo "  test       - Solo ejecutar tests"
    echo "  health     - Verificar estado de servicios"
    echo "  rollback   - Rollback a versión anterior"
    echo "  logs       - Mostrar logs en tiempo real"
    echo "  status     - Mostrar estado de servicios"
    echo "  cleanup    - Limpiar recursos Docker"
    echo "  help       - Mostrar esta ayuda"
    echo ""
    echo "Entornos:"
    echo "  production - Producción (default)"
    echo "  staging    - Staging"
    echo "  development - Desarrollo"
    echo ""
    echo "Ejemplos:"
    echo "  $0 deploy production"
    echo "  $0 build staging"
    echo "  $0 rollback production"
}

# Función principal
main() {
    cd "$PROJECT_ROOT"
    
    COMMAND=${1:-deploy}
    
    case $COMMAND in
        deploy)
            check_prerequisites
            check_environment
            create_backup
            run_tests
            build_images
            deploy
            ;;
        build)
            check_prerequisites
            build_images
            ;;
        test)
            run_tests
            ;;
        health)
            check_health
            ;;
        rollback)
            rollback
            ;;
        logs)
            show_logs
            ;;
        status)
            show_status
            ;;
        cleanup)
            cleanup
            ;;
        help)
            show_help
            ;;
        *)
            log_error "Comando desconocido: $COMMAND"
            show_help
            exit 1
            ;;
    esac
}

# Manejo de señales
trap 'log_error "Script interrumpido"; exit 1' INT TERM

# Ejecutar función principal
main "$@"
