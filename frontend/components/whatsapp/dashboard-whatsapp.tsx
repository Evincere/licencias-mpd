'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare,
  Phone,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  RefreshCw,
  Settings,
  Star,
  Send,
  MessageCircle
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  WhatsAppMonitoringService,
  type EstadoWhatsApp,
  type MetricasWhatsApp,
  type MensajeWhatsApp,
  type ConversacionWhatsApp,
  type AlertaWhatsApp
} from '@/lib/services/whatsapp-monitoring'

export function DashboardWhatsApp() {
  // Estados principales
  const [estado, setEstado] = useState<EstadoWhatsApp | null>(null)
  const [metricas, setMetricas] = useState<MetricasWhatsApp | null>(null)
  const [mensajes, setMensajes] = useState<MensajeWhatsApp[]>([])
  const [conversaciones, setConversaciones] = useState<ConversacionWhatsApp[]>([])
  const [alertas, setAlertas] = useState<AlertaWhatsApp[]>([])
  const [cargando, setCargando] = useState(true)
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date())

  // Cargar datos
  const cargarDatos = async () => {
    try {
      setCargando(true)
      
      const [estadoData, metricasData, mensajesData, conversacionesData, alertasData] = await Promise.all([
        WhatsAppMonitoringService.obtenerEstado(),
        WhatsAppMonitoringService.obtenerMetricas(),
        WhatsAppMonitoringService.obtenerMensajes(20),
        WhatsAppMonitoringService.obtenerConversaciones(),
        WhatsAppMonitoringService.obtenerAlertas()
      ])
      
      setEstado(estadoData)
      setMetricas(metricasData)
      setMensajes(mensajesData)
      setConversaciones(conversacionesData)
      setAlertas(alertasData)
      setUltimaActualizacion(new Date())
      
    } catch (error) {
      console.error('Error cargando datos WhatsApp:', error)
    } finally {
      setCargando(false)
    }
  }

  // Cargar datos inicial y configurar auto-refresh
  useEffect(() => {
    cargarDatos()
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(cargarDatos, 30000)
    return () => clearInterval(interval)
  }, [])

  // Resolver alerta
  const resolverAlerta = async (alertaId: string) => {
    try {
      await WhatsAppMonitoringService.resolverAlerta(alertaId)
      setAlertas(prev => prev.map(a => 
        a.id === alertaId ? { ...a, resuelto: true } : a
      ))
    } catch (error) {
      console.error('Error resolviendo alerta:', error)
    }
  }

  // Obtener color de estado
  const obtenerColorEstado = (estadoAPI: string): string => {
    switch (estadoAPI) {
      case 'activo': return 'text-green-400'
      case 'inactivo': return 'text-gray-400'
      case 'error': return 'text-red-400'
      case 'mantenimiento': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  // Obtener color de severidad
  const obtenerColorSeveridad = (severidad: string): string => {
    switch (severidad) {
      case 'baja': return 'bg-blue-500/20 text-blue-300'
      case 'media': return 'bg-yellow-500/20 text-yellow-300'
      case 'alta': return 'bg-orange-500/20 text-orange-300'
      case 'critica': return 'bg-red-500/20 text-red-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  // Colores para gráficos
  const COLORES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  if (cargando && !estado) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <MessageSquare className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Dashboard WhatsApp</h2>
            <p className="text-gray-400 text-sm">Cargando datos...</p>
          </div>
        </div>
        
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
              <span className="ml-3 text-gray-300">Conectando con WhatsApp Business API...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <MessageSquare className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Dashboard WhatsApp</h2>
            <p className="text-gray-400 text-sm">
              Monitoreo en tiempo real de WhatsApp Business API
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={cargarDatos}
            variant="outline"
            size="sm"
            disabled={cargando}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${cargando ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Estado de conexión */}
      {estado && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    estado.conectado ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-white font-medium">
                    {estado.conectado ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                <div className="text-gray-400 text-sm">
                  {estado.numeroTelefono}
                </div>
                <Badge className={obtenerColorEstado(estado.estadoAPI)}>
                  {estado.estadoAPI}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-xs">Última actividad</div>
                <div className="text-white text-sm">
                  {estado.ultimaActividad.toLocaleTimeString('es-AR')}
                </div>
              </div>
            </div>
            
            {/* Límites de API */}
            <div className="mt-4 bg-gray-800/30 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">Límites de API</span>
                <span className="text-white text-sm">
                  {estado.limitesAPI.mensajesUsados} / {estado.limitesAPI.mensajesPorMinuto} por minuto
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(estado.limitesAPI.mensajesUsados / estado.limitesAPI.mensajesPorMinuto) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas principales */}
      {metricas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">
                    {metricas.mensajesHoy}
                  </div>
                  <div className="text-gray-400 text-xs">Mensajes Hoy</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">
                    {metricas.conversacionesActivas}
                  </div>
                  <div className="text-gray-400 text-xs">Conversaciones Activas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">
                    {metricas.tasaRespuesta.toFixed(1)}%
                  </div>
                  <div className="text-gray-400 text-xs">Tasa Respuesta</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">
                    {metricas.tiempoPromedioRespuesta.toFixed(1)}m
                  </div>
                  <div className="text-gray-400 text-xs">Tiempo Respuesta</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Star className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">
                    {metricas.satisfaccionPromedio.toFixed(1)}
                  </div>
                  <div className="text-gray-400 text-xs">Satisfacción</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas activas */}
      {alertas.length > 0 && (
        <Card className="glass-card border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Alertas Activas ({alertas.filter(a => !a.resuelto).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertas.filter(a => !a.resuelto).map((alerta) => (
                <div key={alerta.id} className="bg-gray-800/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={obtenerColorSeveridad(alerta.severidad)}>
                          {alerta.severidad}
                        </Badge>
                        <span className="text-gray-400 text-sm">
                          {alerta.timestamp.toLocaleTimeString('es-AR')}
                        </span>
                      </div>
                      <div className="text-white">{alerta.mensaje}</div>
                    </div>
                    <Button
                      onClick={() => resolverAlerta(alerta.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      {metricas && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mensajes por hora */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Mensajes por Hora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={metricas.mensajesPorHora}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hora" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                  <Bar dataKey="cantidad" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tipos de consulta */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Tipos de Consulta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={metricas.tiposConsulta}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ tipo, porcentaje }) => `${tipo}: ${porcentaje.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {metricas.tiposConsulta.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conversaciones activas y mensajes recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversaciones activas */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Conversaciones Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {conversaciones.filter(c => c.estado === 'activa').map((conv) => (
                <div key={conv.id} className="bg-gray-800/30 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-medium">{conv.empleado.nombre}</div>
                    <Badge className="bg-blue-500/20 text-blue-300">
                      {conv.tipoConsulta}
                    </Badge>
                  </div>
                  <div className="text-gray-400 text-sm mb-2">
                    {conv.empleado.area} • {conv.empleado.telefono}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      {conv.totalMensajes} mensajes
                    </span>
                    <span className="text-gray-400">
                      Hace {Math.floor((Date.now() - conv.ultimoMensaje.getTime()) / 60000)} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mensajes recientes */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Mensajes Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {mensajes.slice(0, 10).map((mensaje) => (
                <div key={mensaje.id} className="bg-gray-800/30 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        mensaje.tipo === 'enviado' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-white text-sm">
                        {mensaje.tipo === 'enviado' ? 'Enviado' : 'Recibido'}
                      </span>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {mensaje.timestamp.toLocaleTimeString('es-AR')}
                    </span>
                  </div>
                  <div className="text-gray-300 text-sm">
                    {mensaje.contenido.length > 100 
                      ? `${mensaje.contenido.substring(0, 100)}...` 
                      : mensaje.contenido
                    }
                  </div>
                  {mensaje.relacionadoConLicencia && (
                    <Badge className="mt-2 bg-purple-500/20 text-purple-300 text-xs">
                      Licencia
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de actualización */}
      <div className="text-center text-gray-400 text-sm">
        Última actualización: {ultimaActualizacion.toLocaleTimeString('es-AR')} • 
        Actualización automática cada 30 segundos
      </div>
    </div>
  )
}
