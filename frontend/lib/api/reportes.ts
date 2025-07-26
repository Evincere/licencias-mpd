import { apiClient } from './client'
import type { 
  ReporteBase,
  ReporteEjecutivoMensual,
  ReporteCumplimientoNormativo,
  ReporteAreaDepartamento,
  ReporteEmpleadoIndividual,
  ReporteTendenciasAnuales,
  FiltrosReporte,
  TipoReporte,
  ConfiguracionReporte,
  RespuestaGeneracionReporte,
  MetricasAnalytics,
  ConfiguracionExportacion
} from '@/lib/types/reportes'
import type { ApiResponse } from '@/lib/auth/types'

/**
 * Servicio para gestión de reportes y analytics
 */
export class ReportesService {
  
  /**
   * Generar reporte específico
   */
  static async generarReporte(tipo: TipoReporte, filtros: FiltrosReporte): Promise<RespuestaGeneracionReporte> {
    try {
      // TODO: Implementar endpoint real en el backend
      // Por ahora retornamos datos mock según el tipo
      const reporte = await this.generarReporteMock(tipo, filtros)
      
      return {
        reporte,
        tiempoGeneracion: Math.random() * 3000 + 1000, // 1-4 segundos
        urlDescarga: `/api/reportes/${reporte.id}/download`,
        errores: [],
        advertencias: []
      }
    } catch (error) {
      throw new Error(`Error generando reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Obtener lista de reportes disponibles
   */
  static async obtenerReportesDisponibles(): Promise<ConfiguracionReporte[]> {
    // TODO: Implementar endpoint real
    return Promise.resolve([
      {
        id: '1',
        nombre: 'Reporte Mensual Ejecutivo',
        tipo: 'ejecutivo_mensual',
        parametrosDefecto: {
          fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          fechaFin: new Date()
        },
        formatoExportacion: 'ambos',
        plantilla: {
          incluirGraficos: true,
          incluirTablas: true,
          incluirResumenEjecutivo: true,
          logoEmpresa: true
        }
      },
      {
        id: '2',
        nombre: 'Reporte de Cumplimiento Normativo',
        tipo: 'cumplimiento_normativo',
        parametrosDefecto: {
          fechaInicio: new Date(new Date().getFullYear(), 0, 1),
          fechaFin: new Date()
        },
        formatoExportacion: 'pdf',
        plantilla: {
          incluirGraficos: true,
          incluirTablas: true,
          incluirResumenEjecutivo: true,
          logoEmpresa: true
        }
      }
    ])
  }

  /**
   * Obtener métricas para analytics
   */
  static async obtenerMetricasAnalytics(filtros: FiltrosReporte): Promise<MetricasAnalytics> {
    // TODO: Implementar endpoint real
    return Promise.resolve({
      kpis: {
        totalSolicitudes: 1247,
        tasaAprobacion: 87.3,
        tiempoPromedioResolucion: 2.4,
        satisfaccionUsuario: 94.2,
        eficienciaOperativa: 91.8,
        cumplimientoNormativo: 96.5
      },
      tendencias: {
        solicitudesMensuales: [
          { mes: 'Ene', valor: 98 },
          { mes: 'Feb', valor: 87 },
          { mes: 'Mar', valor: 112 },
          { mes: 'Abr', valor: 95 },
          { mes: 'May', valor: 108 },
          { mes: 'Jun', valor: 125 }
        ],
        aprobacionesMensuales: [
          { mes: 'Ene', valor: 85 },
          { mes: 'Feb', valor: 76 },
          { mes: 'Mar', valor: 98 },
          { mes: 'Abr', valor: 83 },
          { mes: 'May', valor: 94 },
          { mes: 'Jun', valor: 109 }
        ],
        tiemposResolucion: [
          { mes: 'Ene', valor: 2.8 },
          { mes: 'Feb', valor: 2.5 },
          { mes: 'Mar', valor: 2.2 },
          { mes: 'Abr', valor: 2.4 },
          { mes: 'May', valor: 2.1 },
          { mes: 'Jun', valor: 2.0 }
        ]
      },
      distribucion: {
        porTipoLicencia: [
          { tipo: 'Licencia Anual', cantidad: 456, porcentaje: 36.6 },
          { tipo: 'Licencia por Enfermedad', cantidad: 298, porcentaje: 23.9 },
          { tipo: 'Licencia Compensatoria', cantidad: 234, porcentaje: 18.8 },
          { tipo: 'Licencia Especial', cantidad: 156, porcentaje: 12.5 },
          { tipo: 'Otras', cantidad: 103, porcentaje: 8.2 }
        ],
        porArea: [
          { area: 'Defensoría Penal', cantidad: 387, porcentaje: 31.0 },
          { area: 'Defensoría Civil', cantidad: 298, porcentaje: 23.9 },
          { area: 'Administración', cantidad: 234, porcentaje: 18.8 },
          { area: 'Recursos Humanos', cantidad: 187, porcentaje: 15.0 },
          { area: 'Sistemas', cantidad: 141, porcentaje: 11.3 }
        ],
        porEstado: [
          { estado: 'Aprobada', cantidad: 1089, porcentaje: 87.3 },
          { estado: 'Pendiente', cantidad: 98, porcentaje: 7.9 },
          { estado: 'Rechazada', cantidad: 45, porcentaje: 3.6 },
          { estado: 'En Revisión', cantidad: 15, porcentaje: 1.2 }
        ]
      },
      comparativas: {
        mesAnterior: { solicitudes: 108, aprobaciones: 94, tiempo: 2.1 },
        añoAnterior: { solicitudes: 1156, aprobaciones: 1001, tiempo: 2.8 },
        cambios: { solicitudes: 7.9, aprobaciones: 8.8, tiempo: -25.0, eficiencia: 12.3 }
      }
    })
  }

  /**
   * Exportar reporte
   */
  static async exportarReporte(
    reporteId: string, 
    configuracion: ConfiguracionExportacion
  ): Promise<Blob> {
    const params = new URLSearchParams()
    params.append('formato', configuracion.formato)
    params.append('incluirGraficos', configuracion.incluirGraficos.toString())
    params.append('incluirDatos', configuracion.incluirDatos.toString())
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/reportes/${reporteId}/export?${params}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    )
    
    if (!response.ok) {
      throw new Error('Error al exportar reporte')
    }
    
    return response.blob()
  }

  /**
   * Programar reporte automático
   */
  static async programarReporte(configuracion: ConfiguracionReporte): Promise<void> {
    const response: ApiResponse<void> = await apiClient.post('/api/reportes/programar', configuracion)
    
    if (!response.success) {
      throw new Error(response.message || 'Error al programar reporte')
    }
  }

  /**
   * Generar datos mock para desarrollo
   */
  private static async generarReporteMock(tipo: TipoReporte, filtros: FiltrosReporte): Promise<ReporteBase> {
    const baseReporte = {
      id: `reporte_${Date.now()}`,
      nombre: this.obtenerNombreReporte(tipo),
      descripcion: this.obtenerDescripcionReporte(tipo),
      tipo,
      fechaGeneracion: new Date(),
      parametros: filtros,
      metadatos: {
        totalRegistros: Math.floor(Math.random() * 1000) + 100,
        tiempoGeneracion: Math.random() * 3000 + 1000,
        version: '1.0.0'
      }
    }

    switch (tipo) {
      case 'ejecutivo_mensual':
        return {
          ...baseReporte,
          datos: {
            resumenGeneral: {
              totalSolicitudes: 125,
              solicitudesAprobadas: 109,
              solicitudesRechazadas: 8,
              solicitudesPendientes: 8,
              tasaAprobacion: 87.2,
              tiempoPromedioResolucion: 2.4
            },
            metricasPorTipo: [
              { tipoLicencia: 'Licencia Anual', cantidad: 45, diasPromedio: 7.2, tendencia: 'ascendente' },
              { tipoLicencia: 'Licencia por Enfermedad', cantidad: 32, diasPromedio: 3.1, tendencia: 'estable' },
              { tipoLicencia: 'Licencia Compensatoria', cantidad: 28, diasPromedio: 1.8, tendencia: 'descendente' }
            ],
            metricasPorArea: [
              { area: 'Defensoría Penal', totalSolicitudes: 38, cobertura: 85.2, eficiencia: 92.1 },
              { area: 'Defensoría Civil', totalSolicitudes: 29, cobertura: 91.3, eficiencia: 88.7 },
              { area: 'Administración', totalSolicitudes: 24, cobertura: 78.9, eficiencia: 95.2 }
            ],
            alertas: [
              { tipo: 'Cobertura Baja', descripcion: 'Defensoría Penal tiene cobertura por debajo del 90%', severidad: 'media' },
              { tipo: 'Tiempo Resolución', descripcion: 'Tiempo promedio de resolución aumentó 15%', severidad: 'baja' }
            ],
            comparativaMesAnterior: {
              solicitudes: { actual: 125, anterior: 108, cambio: 15.7 },
              aprobaciones: { actual: 109, anterior: 94, cambio: 16.0 },
              tiempoResolucion: { actual: 2.4, anterior: 2.1, cambio: 14.3 }
            }
          }
        } as ReporteEjecutivoMensual

      case 'cumplimiento_normativo':
        return {
          ...baseReporte,
          datos: {
            cumplimientoGeneral: {
              porcentajeCumplimiento: 96.5,
              solicitudesFueraPlazo: 12,
              documentacionIncompleta: 8,
              procesosIrregulares: 3
            },
            cumplimientoPorTipo: [
              { 
                tipoLicencia: 'Licencia Anual', 
                reglamentacion: 'Ley 24.185 Art. 15', 
                cumplimiento: 98.2, 
                observaciones: ['Documentación completa', 'Plazos respetados'] 
              },
              { 
                tipoLicencia: 'Licencia por Enfermedad', 
                reglamentacion: 'Decreto 1421/02', 
                cumplimiento: 94.8, 
                observaciones: ['Certificados médicos pendientes en 3 casos'] 
              }
            ],
            auditoria: [
              { 
                fecha: new Date('2024-06-15'), 
                accion: 'Aprobación', 
                usuario: 'admin@mpd.gov.ar', 
                solicitudId: 'SOL-2024-001234', 
                observacion: 'Aprobación automática por cumplimiento de requisitos' 
              }
            ],
            recomendaciones: [
              { 
                area: 'Recursos Humanos', 
                recomendacion: 'Implementar recordatorios automáticos para certificados médicos', 
                prioridad: 'media', 
                plazoImplementacion: '30 días' 
              }
            ]
          }
        } as ReporteCumplimientoNormativo

      case 'area_departamento':
        return {
          ...baseReporte,
          datos: {
            informacionArea: {
              nombre: 'Defensoría Penal',
              totalEmpleados: 45,
              jefeArea: 'Dr. Juan Pérez',
              presupuestoLicencias: 1800
            },
            estadisticasLicencias: {
              totalSolicitudes: 38,
              diasUtilizados: 287,
              diasDisponibles: 1513,
              utilizacionPromedio: 15.9
            },
            distribucionPorTipo: [
              { tipoLicencia: 'Licencia Anual', cantidad: 18, dias: 126, porcentaje: 43.9 },
              { tipoLicencia: 'Licencia por Enfermedad', cantidad: 12, dias: 89, porcentaje: 31.0 },
              { tipoLicencia: 'Licencia Compensatoria', cantidad: 8, dias: 72, porcentaje: 25.1 }
            ],
            empleadosDestacados: {
              mayorUtilizacion: [
                { empleado: 'María González', dias: 28 },
                { empleado: 'Carlos Rodríguez', dias: 25 }
              ],
              menorUtilizacion: [
                { empleado: 'Ana López', dias: 5 },
                { empleado: 'Pedro Martínez', dias: 7 }
              ],
              sinLicencias: [
                { empleado: 'Luis Fernández', ultimaLicencia: null }
              ]
            },
            tendenciasMensuales: [
              { mes: 'Enero', solicitudes: 8, dias: 56, cobertura: 88.9 },
              { mes: 'Febrero', solicitudes: 6, dias: 42, cobertura: 91.1 },
              { mes: 'Marzo', solicitudes: 9, dias: 63, cobertura: 86.7 }
            ],
            comparativaOtrasAreas: [
              { area: 'Defensoría Civil', utilizacion: 18.2, eficiencia: 88.7, ranking: 1 },
              { area: 'Defensoría Penal', utilizacion: 15.9, eficiencia: 92.1, ranking: 2 },
              { area: 'Administración', utilizacion: 14.3, eficiencia: 95.2, ranking: 3 }
            ]
          }
        } as ReporteAreaDepartamento

      case 'empleado_individual':
        return {
          ...baseReporte,
          datos: {
            informacionEmpleado: {
              nombre: 'María',
              apellido: 'González',
              legajo: '12345',
              area: 'Defensoría Penal',
              jerarquia: 'FUNCIONARIO',
              fechaIngreso: new Date('2020-03-15'),
              jefaturaDirecta: 'Dr. Juan Pérez'
            },
            resumenLicencias: {
              totalSolicitudes: 8,
              solicitudesAprobadas: 7,
              solicitudesRechazadas: 1,
              diasTotalesUtilizados: 28,
              diasDisponibles: 32
            },
            licenciasPorTipo: [
              { 
                tipoLicencia: 'Licencia Anual', 
                diasUtilizados: 15, 
                diasDisponibles: 15, 
                ultimaUtilizacion: new Date('2024-05-15'), 
                proximoVencimiento: new Date('2024-12-31') 
              },
              { 
                tipoLicencia: 'Licencia por Enfermedad', 
                diasUtilizados: 8, 
                diasDisponibles: 12, 
                ultimaUtilizacion: new Date('2024-04-10'), 
                proximoVencimiento: null 
              }
            ],
            historialDetallado: [
              { 
                fecha: new Date('2024-05-15'), 
                tipoLicencia: 'Licencia Anual', 
                dias: 5, 
                estado: 'Aprobada', 
                observaciones: 'Vacaciones familiares' 
              },
              { 
                fecha: new Date('2024-04-10'), 
                tipoLicencia: 'Licencia por Enfermedad', 
                dias: 3, 
                estado: 'Aprobada', 
                observaciones: 'Certificado médico adjunto' 
              }
            ],
            comparativaArea: {
              promedioArea: 15.9,
              posicionEmpleado: 1,
              totalEmpleadosArea: 45
            },
            alertasPersonales: [
              { 
                tipo: 'Vencimiento', 
                mensaje: 'Licencia anual vence en 6 meses', 
                fechaVencimiento: new Date('2024-12-31') 
              }
            ]
          }
        } as ReporteEmpleadoIndividual

      case 'tendencias_anuales':
        return {
          ...baseReporte,
          datos: {
            resumenAnual: {
              año: 2024,
              totalSolicitudes: 1247,
              totalDias: 8934,
              crecimientoAnual: 7.9,
              eficienciaPromedio: 91.8
            },
            tendenciasMensuales: [
              { mes: 1, solicitudes: 98, dias: 687, aprobaciones: 85, rechazos: 8 },
              { mes: 2, solicitudes: 87, dias: 612, aprobaciones: 76, rechazos: 6 },
              { mes: 3, solicitudes: 112, dias: 798, aprobaciones: 98, rechazos: 9 }
            ],
            patronesEstacionales: [
              { 
                periodo: 'Verano (Dic-Feb)', 
                descripcion: 'Alta demanda de licencias anuales', 
                impacto: 8.5, 
                recomendacion: 'Planificar cobertura adicional' 
              },
              { 
                periodo: 'Invierno (Jun-Ago)', 
                descripcion: 'Incremento en licencias por enfermedad', 
                impacto: 6.2, 
                recomendacion: 'Reforzar protocolos de salud' 
              }
            ],
            analisisComparativo: {
              añoAnterior: { solicitudes: 1156, dias: 8234, eficiencia: 89.2 },
              cambios: { solicitudes: 7.9, dias: 8.5, eficiencia: 2.9 }
            },
            proyecciones: {
              proximoAño: { solicitudesEstimadas: 1345, diasEstimados: 9627, recursosNecesarios: 15.2 },
              recomendacionesEstrategicas: [
                { 
                  area: 'Recursos Humanos', 
                  recomendacion: 'Incrementar personal de apoyo en 15%', 
                  impactoEstimado: 'Reducción del 20% en tiempos de resolución' 
                }
              ]
            },
            topTendencias: [
              { 
                tendencia: 'Digitalización', 
                descripcion: 'Aumento en solicitudes digitales', 
                datos: [45, 52, 61, 68, 75, 82], 
                prediccion: 'Crecimiento sostenido del 12% mensual' 
              }
            ]
          }
        } as ReporteTendenciasAnuales

      default:
        throw new Error(`Tipo de reporte no soportado: ${tipo}`)
    }
  }

  private static obtenerNombreReporte(tipo: TipoReporte): string {
    const nombres = {
      ejecutivo_mensual: 'Reporte Mensual Ejecutivo',
      cumplimiento_normativo: 'Reporte de Cumplimiento Normativo',
      area_departamento: 'Reporte por Área/Departamento',
      empleado_individual: 'Reporte de Empleado Individual',
      tendencias_anuales: 'Reporte de Tendencias Anuales'
    }
    return nombres[tipo]
  }

  private static obtenerDescripcionReporte(tipo: TipoReporte): string {
    const descripciones = {
      ejecutivo_mensual: 'Resumen ejecutivo mensual con métricas clave y comparativas',
      cumplimiento_normativo: 'Análisis de cumplimiento de normativas y regulaciones',
      area_departamento: 'Estadísticas detalladas por área o departamento',
      empleado_individual: 'Reporte personalizado de actividad de empleado',
      tendencias_anuales: 'Análisis de tendencias y proyecciones anuales'
    }
    return descripciones[tipo]
  }
}

// Hooks personalizados para React Query
export const reportesQueryKeys = {
  all: ['reportes'] as const,
  generar: (tipo: TipoReporte, filtros: FiltrosReporte) => [...reportesQueryKeys.all, 'generar', tipo, filtros] as const,
  disponibles: () => [...reportesQueryKeys.all, 'disponibles'] as const,
  metricas: (filtros: FiltrosReporte) => [...reportesQueryKeys.all, 'metricas', filtros] as const,
}
