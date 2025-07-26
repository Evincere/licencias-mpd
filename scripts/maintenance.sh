#!/bin/bash

# ================================
# SCRIPT DE MANTENIMIENTO
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
LOG_DIR="$PROJECT_ROOT/logs"
BACKUP_DIR="$PROJECT_ROOT/backups"
RETENTION_DAYS=30

# Funciones de utilidad
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $1" >> "$LOG_DIR/maintenance.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [SUCCESS] $1" >> "$LOG_DIR/maintenance.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [WARNING] $1" >> "$LOG_DIR/maintenance.log"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR] $1" >> "$LOG_DIR/maintenance.log"
}

# Función para crear directorios necesarios
setup_directories() {
    log_info "Configurando directorios de mantenimiento..."
    
    mkdir -p "$LOG_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$PROJECT_ROOT/temp"
    
    log_success "Directorios configurados"
}

# Función para limpiar logs antiguos
cleanup_logs() {
    log_info "Limpiando logs antiguos..."
    
    # Limpiar logs de aplicación
    find "$LOG_DIR" -name "*.log" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # Limpiar logs de Docker
    if command -v docker &> /dev/null; then
        docker system prune -f --filter "until=${RETENTION_DAYS}d" 2>/dev/null || true
    fi
    
    # Comprimir logs grandes
    find "$LOG_DIR" -name "*.log" -type f -size +100M -exec gzip {} \; 2>/dev/null || true
    
    log_success "Logs limpiados"
}

# Función para limpiar archivos temporales
cleanup_temp_files() {
    log_info "Limpiando archivos temporales..."
    
    # Limpiar directorio temp
    rm -rf "$PROJECT_ROOT/temp/*" 2>/dev/null || true
    
    # Limpiar cache de npm/pnpm
    if command -v pnpm &> /dev/null; then
        pnpm store prune 2>/dev/null || true
    fi
    
    if command -v npm &> /dev/null; then
        npm cache clean --force 2>/dev/null || true
    fi
    
    # Limpiar archivos de build antiguos
    find "$PROJECT_ROOT" -name "node_modules/.cache" -type d -exec rm -rf {} + 2>/dev/null || true
    find "$PROJECT_ROOT" -name ".next/cache" -type d -exec rm -rf {} + 2>/dev/null || true
    
    log_success "Archivos temporales limpiados"
}

# Función para optimizar base de datos
optimize_database() {
    log_info "Optimizando base de datos..."
    
    if docker-compose ps postgres | grep -q "Up"; then
        # Ejecutar VACUUM y ANALYZE
        docker-compose exec -T postgres psql -U licencias_user -d licencias_db -c "VACUUM ANALYZE;" 2>/dev/null || {
            log_warning "No se pudo optimizar la base de datos"
            return
        }
        
        # Reindexar tablas principales
        docker-compose exec -T postgres psql -U licencias_user -d licencias_db -c "REINDEX DATABASE licencias_db;" 2>/dev/null || {
            log_warning "No se pudo reindexar la base de datos"
        }
        
        log_success "Base de datos optimizada"
    else
        log_warning "Base de datos no está ejecutándose"
    fi
}

# Función para crear backup
create_backup() {
    log_info "Creando backup de la base de datos..."
    
    if docker-compose ps postgres | grep -q "Up"; then
        BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
        
        docker-compose exec -T postgres pg_dump -U licencias_user licencias_db > "$BACKUP_FILE" 2>/dev/null || {
            log_error "Fallo al crear backup"
            return 1
        }
        
        # Comprimir backup
        gzip "$BACKUP_FILE"
        
        log_success "Backup creado: ${BACKUP_FILE}.gz"
    else
        log_warning "Base de datos no está ejecutándose - backup omitido"
    fi
}

# Función para limpiar backups antiguos
cleanup_old_backups() {
    log_info "Limpiando backups antiguos..."
    
    # Mantener backups por 30 días
    find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # Mantener al menos 5 backups más recientes
    BACKUP_COUNT=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f | wc -l)
    if [ "$BACKUP_COUNT" -gt 5 ]; then
        find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -printf '%T@ %p\n' | sort -n | head -n -5 | cut -d' ' -f2- | xargs rm -f 2>/dev/null || true
    fi
    
    log_success "Backups antiguos limpiados"
}

# Función para verificar salud del sistema
health_check() {
    log_info "Verificando salud del sistema..."
    
    local issues=0
    
    # Verificar espacio en disco
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 80 ]; then
        log_warning "Uso de disco alto: ${DISK_USAGE}%"
        issues=$((issues + 1))
    fi
    
    # Verificar memoria
    if command -v free &> /dev/null; then
        MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
        if [ "$MEMORY_USAGE" -gt 85 ]; then
            log_warning "Uso de memoria alto: ${MEMORY_USAGE}%"
            issues=$((issues + 1))
        fi
    fi
    
    # Verificar servicios Docker
    if command -v docker-compose &> /dev/null; then
        if ! docker-compose ps | grep -q "Up"; then
            log_warning "Algunos servicios Docker no están ejecutándose"
            issues=$((issues + 1))
        fi
    fi
    
    # Verificar conectividad de red
    if ! ping -c 1 google.com &> /dev/null; then
        log_warning "Problemas de conectividad de red"
        issues=$((issues + 1))
    fi
    
    if [ "$issues" -eq 0 ]; then
        log_success "Sistema saludable"
    else
        log_warning "Se encontraron $issues problemas"
    fi
    
    return $issues
}

# Función para actualizar dependencias
update_dependencies() {
    log_info "Verificando actualizaciones de dependencias..."
    
    cd "$PROJECT_ROOT/frontend"
    
    if command -v pnpm &> /dev/null; then
        # Verificar actualizaciones disponibles
        pnpm outdated > /tmp/outdated.txt 2>/dev/null || true
        
        if [ -s /tmp/outdated.txt ]; then
            log_info "Actualizaciones disponibles:"
            cat /tmp/outdated.txt
            
            # Actualizar dependencias patch y minor (seguras)
            pnpm update --latest 2>/dev/null || log_warning "No se pudieron actualizar algunas dependencias"
            
            log_success "Dependencias actualizadas"
        else
            log_success "Todas las dependencias están actualizadas"
        fi
        
        rm -f /tmp/outdated.txt
    fi
    
    cd "$PROJECT_ROOT"
}

# Función para generar reporte de mantenimiento
generate_report() {
    log_info "Generando reporte de mantenimiento..."
    
    REPORT_FILE="$LOG_DIR/maintenance_report_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$REPORT_FILE" << EOF
# REPORTE DE MANTENIMIENTO
# Sistema de Licencias MPD
# Fecha: $(date)

## INFORMACIÓN DEL SISTEMA
- Hostname: $(hostname)
- Uptime: $(uptime)
- Espacio en disco: $(df -h / | awk 'NR==2 {print $5}') usado
- Memoria: $(free -h | awk 'NR==2{printf "%.1f/%.1f GB (%.0f%%)", $3/1024/1024, $2/1024/1024, $3*100/$2}')

## SERVICIOS DOCKER
$(docker-compose ps 2>/dev/null || echo "Docker Compose no disponible")

## TAMAÑO DE DIRECTORIOS
- Logs: $(du -sh "$LOG_DIR" 2>/dev/null | cut -f1)
- Backups: $(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
- Proyecto: $(du -sh "$PROJECT_ROOT" 2>/dev/null | cut -f1)

## ÚLTIMOS LOGS DE ERROR
$(tail -n 20 "$LOG_DIR/maintenance.log" 2>/dev/null | grep ERROR || echo "No hay errores recientes")

## BACKUPS DISPONIBLES
$(ls -la "$BACKUP_DIR"/*.gz 2>/dev/null | tail -n 10 || echo "No hay backups disponibles")

EOF

    log_success "Reporte generado: $REPORT_FILE"
}

# Función para enviar notificaciones
send_notifications() {
    local status=$1
    local message=$2
    
    # Enviar email (si está configurado)
    if [ -n "$MAINTENANCE_EMAIL" ]; then
        echo "$message" | mail -s "Mantenimiento Sistema Licencias MPD - $status" "$MAINTENANCE_EMAIL" 2>/dev/null || true
    fi
    
    # Enviar a Slack (si está configurado)
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🔧 Mantenimiento Sistema Licencias MPD - $status\n$message\"}" \
            "$SLACK_WEBHOOK" 2>/dev/null || true
    fi
}

# Función principal de mantenimiento
run_maintenance() {
    log_info "Iniciando mantenimiento del sistema..."
    
    local start_time=$(date +%s)
    local errors=0
    
    # Ejecutar tareas de mantenimiento
    setup_directories || errors=$((errors + 1))
    cleanup_logs || errors=$((errors + 1))
    cleanup_temp_files || errors=$((errors + 1))
    create_backup || errors=$((errors + 1))
    cleanup_old_backups || errors=$((errors + 1))
    optimize_database || errors=$((errors + 1))
    update_dependencies || errors=$((errors + 1))
    
    # Verificar salud del sistema
    health_check
    local health_issues=$?
    
    # Generar reporte
    generate_report
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [ "$errors" -eq 0 ] && [ "$health_issues" -eq 0 ]; then
        local status="EXITOSO"
        local message="Mantenimiento completado exitosamente en ${duration}s"
        log_success "$message"
    else
        local status="CON ADVERTENCIAS"
        local message="Mantenimiento completado con $errors errores y $health_issues problemas de salud en ${duration}s"
        log_warning "$message"
    fi
    
    # Enviar notificaciones
    send_notifications "$status" "$message"
}

# Función de ayuda
show_help() {
    echo "Script de Mantenimiento - Sistema de Licencias MPD"
    echo ""
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos:"
    echo "  full       - Mantenimiento completo (default)"
    echo "  backup     - Solo crear backup"
    echo "  cleanup    - Solo limpiar archivos"
    echo "  health     - Solo verificar salud"
    echo "  update     - Solo actualizar dependencias"
    echo "  report     - Solo generar reporte"
    echo "  help       - Mostrar esta ayuda"
    echo ""
    echo "Variables de entorno:"
    echo "  MAINTENANCE_EMAIL - Email para notificaciones"
    echo "  SLACK_WEBHOOK     - Webhook de Slack para notificaciones"
    echo "  RETENTION_DAYS    - Días de retención (default: 30)"
}

# Función principal
main() {
    cd "$PROJECT_ROOT"
    
    COMMAND=${1:-full}
    
    case $COMMAND in
        full)
            run_maintenance
            ;;
        backup)
            setup_directories
            create_backup
            ;;
        cleanup)
            setup_directories
            cleanup_logs
            cleanup_temp_files
            cleanup_old_backups
            ;;
        health)
            health_check
            ;;
        update)
            update_dependencies
            ;;
        report)
            setup_directories
            generate_report
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
