'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { EmpleadosService } from '@/lib/api/empleados'
import type { CalendarioEmpleado } from '@/lib/types/empleados'

interface CalendarioEmpleadoProps {
  empleadoId: string
}

interface EventoCalendario {
  id: string
  titulo: string
  fechaInicio: Date
  fechaFin: Date
  tipo: 'licencia' | 'feria' | 'receso' | 'feriado'
  estado?: string
  color: string
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function CalendarioEmpleado({ empleadoId }: CalendarioEmpleadoProps) {
  const [fechaActual, setFechaActual] = useState(new Date())
  const [eventos, setEventos] = useState<EventoCalendario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos del calendario
  const cargarCalendario = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const calendario = await EmpleadosService.obtenerCalendarioEmpleado(empleadoId)
      
      // Convertir datos a eventos del calendario
      const eventosCalendario: EventoCalendario[] = [
        // Licencias históricas
        ...calendario.licenciasHistoricas.map(licencia => ({
          id: licencia.id,
          titulo: licencia.tipo,
          fechaInicio: new Date(licencia.fechaInicio),
          fechaFin: new Date(licencia.fechaFin),
          tipo: 'licencia' as const,
          estado: licencia.estado,
          color: licencia.color
        })),
        // Licencias futuras
        ...calendario.licenciasFuturas.map(licencia => ({
          id: licencia.id,
          titulo: licencia.tipo,
          fechaInicio: new Date(licencia.fechaInicio),
          fechaFin: new Date(licencia.fechaFin),
          tipo: 'licencia' as const,
          estado: licencia.estado,
          color: licencia.color
        })),
        // Períodos especiales
        ...calendario.periodosEspeciales.map(periodo => ({
          id: `${periodo.tipo}-${periodo.fechaInicio}`,
          titulo: periodo.nombre,
          fechaInicio: new Date(periodo.fechaInicio),
          fechaFin: new Date(periodo.fechaFin),
          tipo: periodo.tipo as any,
          color: periodo.color
        }))
      ]
      
      setEventos(eventosCalendario)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar calendario')
      console.error('Error cargando calendario:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarCalendario()
  }, [empleadoId])

  // Navegar entre meses
  const navegarMes = (direccion: 'anterior' | 'siguiente') => {
    setFechaActual(prev => {
      const nuevaFecha = new Date(prev)
      if (direccion === 'anterior') {
        nuevaFecha.setMonth(prev.getMonth() - 1)
      } else {
        nuevaFecha.setMonth(prev.getMonth() + 1)
      }
      return nuevaFecha
    })
  }

  // Obtener días del mes
  const obtenerDiasMes = () => {
    const año = fechaActual.getFullYear()
    const mes = fechaActual.getMonth()
    
    const primerDia = new Date(año, mes, 1)
    const ultimoDia = new Date(año, mes + 1, 0)
    const diasEnMes = ultimoDia.getDate()
    const diaSemanaInicio = primerDia.getDay()
    
    const dias: (Date | null)[] = []
    
    // Días vacíos al inicio
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null)
    }
    
    // Días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      dias.push(new Date(año, mes, dia))
    }
    
    return dias
  }

  // Obtener eventos para una fecha específica
  const obtenerEventosFecha = (fecha: Date): EventoCalendario[] => {
    return eventos.filter(evento => {
      const fechaEvento = new Date(fecha)
      fechaEvento.setHours(0, 0, 0, 0)
      
      const inicioEvento = new Date(evento.fechaInicio)
      inicioEvento.setHours(0, 0, 0, 0)
      
      const finEvento = new Date(evento.fechaFin)
      finEvento.setHours(23, 59, 59, 999)
      
      return fechaEvento >= inicioEvento && fechaEvento <= finEvento
    })
  }

  // Renderizar icono de estado
  const renderIconoEstado = (estado?: string) => {
    switch (estado) {
      case 'aprobada':
        return <CheckCircle className="w-3 h-3 text-green-400" />
      case 'rechazada':
        return <XCircle className="w-3 h-3 text-red-400" />
      case 'pendiente':
        return <Clock className="w-3 h-3 text-yellow-400" />
      case 'en_revision':
        return <AlertCircle className="w-3 h-3 text-blue-400" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
            <span className="ml-3 text-gray-300">Cargando calendario...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass-card border-red-500/30">
        <CardContent className="p-8">
          <div className="flex items-center text-red-400">
            <Calendar className="w-5 h-5 mr-2" />
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  const diasMes = obtenerDiasMes()

  return (
    <div className="space-y-6">
      {/* Header del calendario */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendario Personal
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navegarMes('anterior')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-white font-medium min-w-[150px] text-center">
                {MESES[fechaActual.getMonth()]} {fechaActual.getFullYear()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navegarMes('siguiente')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DIAS_SEMANA.map(dia => (
              <div key={dia} className="p-2 text-center text-gray-400 text-sm font-medium">
                {dia}
              </div>
            ))}
          </div>
          
          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {diasMes.map((fecha, index) => {
              if (!fecha) {
                return <div key={index} className="p-2 h-24" />
              }
              
              const eventosDia = obtenerEventosFecha(fecha)
              const esHoy = fecha.toDateString() === new Date().toDateString()
              
              return (
                <div
                  key={fecha.toISOString()}
                  className={`p-2 h-24 border border-gray-700 rounded-lg ${
                    esHoy ? 'bg-primary-500/20 border-primary-500/50' : 'bg-gray-800/30'
                  } hover:bg-gray-700/50 transition-colors`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    esHoy ? 'text-primary-400' : 'text-white'
                  }`}>
                    {fecha.getDate()}
                  </div>
                  
                  {/* Eventos del día */}
                  <div className="space-y-1">
                    {eventosDia.slice(0, 2).map(evento => (
                      <div
                        key={evento.id}
                        className="text-xs p-1 rounded truncate"
                        style={{ backgroundColor: evento.color + '40', color: evento.color }}
                        title={`${evento.titulo} (${evento.fechaInicio.toLocaleDateString()} - ${evento.fechaFin.toLocaleDateString()})`}
                      >
                        <div className="flex items-center gap-1">
                          {renderIconoEstado(evento.estado)}
                          <span className="truncate">{evento.titulo}</span>
                        </div>
                      </div>
                    ))}
                    {eventosDia.length > 2 && (
                      <div className="text-xs text-gray-400">
                        +{eventosDia.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white text-sm">Leyenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-gray-300 text-sm">Licencias Aprobadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500"></div>
              <span className="text-gray-300 text-sm">Licencias Pendientes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span className="text-gray-300 text-sm">Feria Judicial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500"></div>
              <span className="text-gray-300 text-sm">Períodos Especiales</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próximas licencias */}
      {eventos.filter(e => e.fechaInicio > new Date() && e.tipo === 'licencia').length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white text-sm">Próximas Licencias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {eventos
                .filter(e => e.fechaInicio > new Date() && e.tipo === 'licencia')
                .sort((a, b) => a.fechaInicio.getTime() - b.fechaInicio.getTime())
                .slice(0, 5)
                .map(evento => (
                  <div key={evento.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{evento.titulo}</div>
                      <div className="text-gray-400 text-sm">
                        {evento.fechaInicio.toLocaleDateString()} - {evento.fechaFin.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderIconoEstado(evento.estado)}
                      <Badge 
                        className="text-xs"
                        style={{ backgroundColor: evento.color + '40', color: evento.color }}
                      >
                        {evento.estado || 'Programada'}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
