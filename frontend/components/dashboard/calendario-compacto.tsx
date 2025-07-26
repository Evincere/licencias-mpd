'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  TrendingUp,
  Eye,
  ChevronRight
} from 'lucide-react'
import { CalendarioService } from '@/lib/api/calendario'
import type { CalendarioCompacto } from '@/lib/types/calendario'
import { useRouter } from 'next/navigation'

interface CalendarioCompactoProps {
  className?: string
}

export function CalendarioCompactoComponent({ className = '' }: CalendarioCompactoProps) {
  const router = useRouter()
  const [datos, setDatos] = useState<CalendarioCompacto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos del calendario compacto
  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await CalendarioService.obtenerCalendarioCompacto()
      setDatos(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar calendario')
      console.error('Error cargando calendario compacto:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
    
    // Actualizar cada 5 minutos
    const interval = setInterval(cargarDatos, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Formatear fecha relativa
  const formatearFechaRelativa = (fecha: Date): string => {
    const hoy = new Date()
    const diffTime = fecha.getTime() - hoy.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Mañana'
    if (diffDays === -1) return 'Ayer'
    if (diffDays > 0) return `En ${diffDays} días`
    return `Hace ${Math.abs(diffDays)} días`
  }

  // Obtener color de estado de cobertura
  const getColorCobertura = (estado: string): string => {
    switch (estado) {
      case 'optima': return 'text-green-400'
      case 'aceptable': return 'text-yellow-400'
      case 'critica': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  // Obtener icono de estado de cobertura
  const getIconoCobertura = (estado: string) => {
    switch (estado) {
      case 'optima': return '🟢'
      case 'aceptable': return '🟡'
      case 'critica': return '🔴'
      default: return '⚪'
    }
  }

  if (loading) {
    return (
      <Card className={`glass-card ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-400"></div>
            <span className="ml-3 text-gray-300 text-sm">Cargando...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !datos) {
    return (
      <Card className={`glass-card border-red-500/30 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            {error || 'Error al cargar datos'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendario
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/calendario')}
            className="text-gray-400 hover:text-white"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alertas importantes */}
        {datos.alertas.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-white font-medium text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alertas
            </h4>
            {datos.alertas.slice(0, 2).map((alerta, index) => (
              <div 
                key={index}
                className={`p-2 rounded-lg text-xs ${
                  alerta.severidad === 'error' ? 'bg-red-500/20 text-red-300' :
                  alerta.severidad === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}
              >
                <div className="font-medium">{alerta.tipo.replace('_', ' ').toUpperCase()}</div>
                <div>{alerta.mensaje}</div>
                {alerta.fecha && (
                  <div className="text-xs opacity-75 mt-1">
                    {formatearFechaRelativa(alerta.fecha)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Próximas licencias */}
        <div className="space-y-2">
          <h4 className="text-white font-medium text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Próximas Licencias
          </h4>
          {datos.proximasLicencias.length === 0 ? (
            <div className="text-gray-400 text-xs">
              No hay licencias próximas
            </div>
          ) : (
            <div className="space-y-2">
              {datos.proximasLicencias.slice(0, 3).map((licencia) => (
                <div key={licencia.id} className="bg-gray-800/50 p-2 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-xs font-medium">
                        {licencia.empleado}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {licencia.tipo} • {licencia.dias} días
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-300 text-xs">
                        {formatearFechaRelativa(licencia.fechaInicio)}
                      </div>
                      <Badge 
                        className={`text-xs ${
                          licencia.estado === 'aprobada' ? 'bg-green-500/20 text-green-300' :
                          licencia.estado === 'pendiente' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}
                      >
                        {licencia.estado}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {datos.proximasLicencias.length > 3 && (
                <div className="text-gray-400 text-xs text-center">
                  +{datos.proximasLicencias.length - 3} más
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cobertura por área */}
        <div className="space-y-2">
          <h4 className="text-white font-medium text-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            Cobertura por Área
          </h4>
          <div className="space-y-2">
            {datos.coberturaPorArea.map((area) => (
              <div key={area.area} className="bg-gray-800/50 p-2 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-xs font-medium">
                      {area.area}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {area.empleadosPresentes}/{area.empleadosTotal} empleados
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium ${getColorCobertura(area.estado)}`}>
                      {getIconoCobertura(area.estado)} {area.cobertura}%
                    </div>
                  </div>
                </div>
                {/* Barra de progreso */}
                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                  <div 
                    className={`h-1.5 rounded-full ${
                      area.estado === 'optima' ? 'bg-green-500' :
                      area.estado === 'aceptable' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${area.cobertura}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eventos de hoy */}
        {datos.eventosHoy.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-white font-medium text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Eventos de Hoy
            </h4>
            <div className="space-y-1">
              {datos.eventosHoy.slice(0, 2).map((evento) => (
                <div key={evento.id} className="bg-gray-800/50 p-2 rounded-lg">
                  <div className="text-white text-xs font-medium">
                    {evento.titulo}
                  </div>
                  {evento.empleado && (
                    <div className="text-gray-400 text-xs">
                      {evento.empleado.nombre} {evento.empleado.apellido}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón para ver calendario completo */}
        <Button
          onClick={() => router.push('/dashboard/calendario')}
          variant="outline"
          size="sm"
          className="w-full text-xs"
        >
          Ver Calendario Completo
          <ChevronRight className="w-3 h-3 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}
