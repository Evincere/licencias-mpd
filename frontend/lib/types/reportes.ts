// Tipos para el sistema de reportes y analytics

export interface FiltrosReporte {
  fechaInicio: Date
  fechaFin: Date
  areas?: string[]
  empleados?: string[]
  tiposLicencia?: string[]
  estados?: string[]
  jerarquias?: string[]
}

export interface ReporteBase {
  id: string
  nombre: string
  descripcion: string
  tipo: TipoReporte
  fechaGeneracion: Date
  parametros: FiltrosReporte
  datos: any
  metadatos: {
    totalRegistros: number
    tiempoGeneracion: number
    version: string
  }
}

export type TipoReporte = 
  | 'ejecutivo_mensual'
  | 'cumplimiento_normativo'
  | 'area_departamento'
  | 'empleado_individual'
  | 'tendencias_anuales'

// Reporte Mensual Ejecutivo
export interface ReporteEjecutivoMensual extends ReporteBase {
  tipo: 'ejecutivo_mensual'
  datos: {
    resumenGeneral: {
      totalSolicitudes: number
      solicitudesAprobadas: number
      solicitudesRechazadas: number
      solicitudesPendientes: number
      tasaAprobacion: number
      tiempoPromedioResolucion: number
    }
    metricasPorTipo: Array<{
      tipoLicencia: string
      cantidad: number
      diasPromedio: number
      tendencia: 'ascendente' | 'descendente' | 'estable'
    }>
    metricasPorArea: Array<{
      area: string
      totalSolicitudes: number
      cobertura: number
      eficiencia: number
    }>
    alertas: Array<{
      tipo: string
      descripcion: string
      severidad: 'alta' | 'media' | 'baja'
    }>
    comparativaMesAnterior: {
      solicitudes: { actual: number, anterior: number, cambio: number }
      aprobaciones: { actual: number, anterior: number, cambio: number }
      tiempoResolucion: { actual: number, anterior: number, cambio: number }
    }
  }
}

// Reporte de Cumplimiento Normativo
export interface ReporteCumplimientoNormativo extends ReporteBase {
  tipo: 'cumplimiento_normativo'
  datos: {
    cumplimientoGeneral: {
      porcentajeCumplimiento: number
      solicitudesFueraPlazo: number
      documentacionIncompleta: number
      procesosIrregulares: number
    }
    cumplimientoPorTipo: Array<{
      tipoLicencia: string
      reglamentacion: string
      cumplimiento: number
      observaciones: string[]
    }>
    auditoria: Array<{
      fecha: Date
      accion: string
      usuario: string
      solicitudId: string
      observacion: string
    }>
    recomendaciones: Array<{
      area: string
      recomendacion: string
      prioridad: 'alta' | 'media' | 'baja'
      plazoImplementacion: string
    }>
  }
}

// Reporte por Área/Departamento
export interface ReporteAreaDepartamento extends ReporteBase {
  tipo: 'area_departamento'
  datos: {
    informacionArea: {
      nombre: string
      totalEmpleados: number
      jefeArea: string
      presupuestoLicencias: number
    }
    estadisticasLicencias: {
      totalSolicitudes: number
      diasUtilizados: number
      diasDisponibles: number
      utilizacionPromedio: number
    }
    distribucionPorTipo: Array<{
      tipoLicencia: string
      cantidad: number
      dias: number
      porcentaje: number
    }>
    empleadosDestacados: {
      mayorUtilizacion: Array<{ empleado: string, dias: number }>
      menorUtilizacion: Array<{ empleado: string, dias: number }>
      sinLicencias: Array<{ empleado: string, ultimaLicencia: Date | null }>
    }
    tendenciasMensuales: Array<{
      mes: string
      solicitudes: number
      dias: number
      cobertura: number
    }>
    comparativaOtrasAreas: Array<{
      area: string
      utilizacion: number
      eficiencia: number
      ranking: number
    }>
  }
}

// Reporte de Empleado Individual
export interface ReporteEmpleadoIndividual extends ReporteBase {
  tipo: 'empleado_individual'
  datos: {
    informacionEmpleado: {
      nombre: string
      apellido: string
      legajo: string
      area: string
      jerarquia: string
      fechaIngreso: Date
      jefaturaDirecta: string
    }
    resumenLicencias: {
      totalSolicitudes: number
      solicitudesAprobadas: number
      solicitudesRechazadas: number
      diasTotalesUtilizados: number
      diasDisponibles: number
    }
    licenciasPorTipo: Array<{
      tipoLicencia: string
      diasUtilizados: number
      diasDisponibles: number
      ultimaUtilizacion: Date | null
      proximoVencimiento: Date | null
    }>
    historialDetallado: Array<{
      fecha: Date
      tipoLicencia: string
      dias: number
      estado: string
      observaciones: string
    }>
    comparativaArea: {
      promedioArea: number
      posicionEmpleado: number
      totalEmpleadosArea: number
    }
    alertasPersonales: Array<{
      tipo: string
      mensaje: string
      fechaVencimiento: Date | null
    }>
  }
}

// Reporte de Tendencias Anuales
export interface ReporteTendenciasAnuales extends ReporteBase {
  tipo: 'tendencias_anuales'
  datos: {
    resumenAnual: {
      año: number
      totalSolicitudes: number
      totalDias: number
      crecimientoAnual: number
      eficienciaPromedio: number
    }
    tendenciasMensuales: Array<{
      mes: number
      solicitudes: number
      dias: number
      aprobaciones: number
      rechazos: number
    }>
    patronesEstacionales: Array<{
      periodo: string
      descripcion: string
      impacto: number
      recomendacion: string
    }>
    analisisComparativo: {
      añoAnterior: {
        solicitudes: number
        dias: number
        eficiencia: number
      }
      cambios: {
        solicitudes: number
        dias: number
        eficiencia: number
      }
    }
    proyecciones: {
      proximoAño: {
        solicitudesEstimadas: number
        diasEstimados: number
        recursosNecesarios: number
      }
      recomendacionesEstrategicas: Array<{
        area: string
        recomendacion: string
        impactoEstimado: string
      }>
    }
    topTendencias: Array<{
      tendencia: string
      descripcion: string
      datos: number[]
      prediccion: string
    }>
  }
}

// Configuración de Reportes
export interface ConfiguracionReporte {
  id: string
  nombre: string
  tipo: TipoReporte
  parametrosDefecto: FiltrosReporte
  formatoExportacion: 'pdf' | 'excel' | 'ambos'
  programacion?: {
    activa: boolean
    frecuencia: 'diaria' | 'semanal' | 'mensual' | 'trimestral'
    destinatarios: string[]
    proximaEjecucion: Date
  }
  plantilla: {
    incluirGraficos: boolean
    incluirTablas: boolean
    incluirResumenEjecutivo: boolean
    logoEmpresa: boolean
  }
}

// Respuesta de generación de reporte
export interface RespuestaGeneracionReporte {
  reporte: ReporteBase
  tiempoGeneracion: number
  urlDescarga?: string
  errores?: string[]
  advertencias?: string[]
}

// Métricas para Dashboard de Analytics
export interface MetricasAnalytics {
  kpis: {
    totalSolicitudes: number
    tasaAprobacion: number
    tiempoPromedioResolucion: number
    satisfaccionUsuario: number
    eficienciaOperativa: number
    cumplimientoNormativo: number
  }
  tendencias: {
    solicitudesMensuales: Array<{ mes: string, valor: number }>
    aprobacionesMensuales: Array<{ mes: string, valor: number }>
    tiemposResolucion: Array<{ mes: string, valor: number }>
  }
  distribucion: {
    porTipoLicencia: Array<{ tipo: string, cantidad: number, porcentaje: number }>
    porArea: Array<{ area: string, cantidad: number, porcentaje: number }>
    porEstado: Array<{ estado: string, cantidad: number, porcentaje: number }>
  }
  comparativas: {
    mesAnterior: { solicitudes: number, aprobaciones: number, tiempo: number }
    añoAnterior: { solicitudes: number, aprobaciones: number, tiempo: number }
    cambios: { solicitudes: number, aprobaciones: number, tiempo: number, eficiencia: number }
  }
}

// Configuración de Dashboard
export interface ConfiguracionDashboard {
  widgets: Array<{
    id: string
    tipo: 'grafico' | 'metrica' | 'tabla' | 'mapa'
    titulo: string
    posicion: { x: number, y: number, w: number, h: number }
    configuracion: any
    visible: boolean
  }>
  filtrosGlobales: FiltrosReporte
  actualizacionAutomatica: {
    activa: boolean
    intervalo: number // minutos
  }
  tema: 'claro' | 'oscuro' | 'auto'
}

// Exportación
export interface ConfiguracionExportacion {
  formato: 'pdf' | 'excel' | 'csv' | 'json'
  incluirGraficos: boolean
  incluirDatos: boolean
  incluirMetadatos: boolean
  plantilla?: string
  configuracionPDF?: {
    orientacion: 'portrait' | 'landscape'
    tamaño: 'A4' | 'A3' | 'letter'
    incluirPortada: boolean
    incluirIndice: boolean
  }
}

// Constantes
export const TIPOS_REPORTE: Record<TipoReporte, string> = {
  ejecutivo_mensual: 'Reporte Mensual Ejecutivo',
  cumplimiento_normativo: 'Reporte de Cumplimiento Normativo',
  area_departamento: 'Reporte por Área/Departamento',
  empleado_individual: 'Reporte de Empleado Individual',
  tendencias_anuales: 'Reporte de Tendencias Anuales'
}

export const FRECUENCIAS_PROGRAMACION = {
  diaria: 'Diaria',
  semanal: 'Semanal',
  mensual: 'Mensual',
  trimestral: 'Trimestral'
}

export const FORMATOS_EXPORTACION = {
  pdf: 'PDF',
  excel: 'Excel',
  csv: 'CSV',
  json: 'JSON'
}
