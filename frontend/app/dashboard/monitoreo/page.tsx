'use client'

/**
 * Dashboard de Monitoreo del Sistema
 * Sistema de Licencias MPD
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  MemoryStick, 
  Monitor, 
  Server, 
  Users, 
  Zap,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useMetrics } from '@/lib/utils/metrics'
import { useLogger } from '@/lib/utils/logger'

// Datos simulados para el dashboard
const systemMetrics = {
  cpu: 45.2,
  memory: 67.8,
  disk: 34.1,
  network: 12.5,
  uptime: '15d 8h 23m',
  requests: 1247,
  errors: 3,
  activeUsers: 23
}

const performanceData = [
  { time: '00:00', cpu: 25, memory: 45, requests: 120 },
  { time: '04:00', cpu: 30, memory: 52, requests: 89 },
  { time: '08:00', cpu: 65, memory: 78, requests: 340 },
  { time: '12:00', cpu: 45, memory: 65, requests: 280 },
  { time: '16:00', cpu: 55, memory: 72, requests: 420 },
  { time: '20:00', cpu: 35, memory: 58, requests: 180 },
]

const alertsData = [
  { id: '1', type: 'warning', message: 'Uso de memoria alto en servidor web', time: '2 min ago', severity: 'medium' },
  { id: '2', type: 'info', message: 'Backup completado exitosamente', time: '15 min ago', severity: 'low' },
  { id: '3', type: 'error', message: 'Fallo en conexión a base de datos', time: '1 hora ago', severity: 'high' },
]

const serviceStatus = [
  { name: 'Frontend', status: 'healthy', uptime: '99.9%', responseTime: '45ms' },
  { name: 'Backend API', status: 'healthy', uptime: '99.8%', responseTime: '120ms' },
  { name: 'Base de Datos', status: 'healthy', uptime: '99.9%', responseTime: '8ms' },
  { name: 'Redis Cache', status: 'healthy', uptime: '100%', responseTime: '2ms' },
  { name: 'IA Service', status: 'warning', uptime: '98.5%', responseTime: '250ms' },
  { name: 'WhatsApp API', status: 'healthy', uptime: '99.7%', responseTime: '180ms' },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function MonitoreoPage() {
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const { getMetrics, getAlerts, getMetricsSummary } = useMetrics()
  const { info } = useLogger()

  useEffect(() => {
    info('Monitoring dashboard loaded')
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 30000)

    return () => clearInterval(interval)
  }, [info])

  const handleRefresh = async () => {
    setRefreshing(true)
    info('Manual refresh triggered')
    
    // Simular carga de datos
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setLastUpdate(new Date())
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'error': return <AlertTriangle className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
      critical: 'bg-red-200 text-red-900'
    }
    return variants[severity as keyof typeof variants] || variants.low
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Monitoreo del Sistema</h1>
          <p className="text-gray-400 mt-1">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">CPU</CardTitle>
            <Monitor className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{systemMetrics.cpu}%</div>
            <p className="text-xs text-gray-400">+2.1% desde ayer</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Memoria</CardTitle>
            <MemoryStick className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{systemMetrics.memory}%</div>
            <p className="text-xs text-gray-400">-1.2% desde ayer</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Requests</CardTitle>
            <Activity className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{systemMetrics.requests}</div>
            <p className="text-xs text-gray-400">+12.5% desde ayer</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{systemMetrics.activeUsers}</div>
            <p className="text-xs text-gray-400">+5 desde ayer</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-800/50 border-gray-700">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de Performance */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Performance en Tiempo Real</CardTitle>
                <CardDescription className="text-gray-400">
                  Métricas de las últimas 24 horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="memory" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="requests" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Estado del Sistema */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Estado del Sistema</CardTitle>
                <CardDescription className="text-gray-400">
                  Información general del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Uptime</span>
                  <span className="text-white font-mono">{systemMetrics.uptime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Disco</span>
                  <span className="text-white">{systemMetrics.disk}% usado</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Red</span>
                  <span className="text-white">{systemMetrics.network} MB/s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Errores</span>
                  <Badge variant={systemMetrics.errors > 5 ? "destructive" : "secondary"}>
                    {systemMetrics.errors}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Performance */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Métricas de Performance</CardTitle>
              <CardDescription className="text-gray-400">
                Análisis detallado de rendimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="memory" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Servicios */}
        <TabsContent value="services" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Estado de Servicios</CardTitle>
              <CardDescription className="text-gray-400">
                Monitoreo de todos los servicios del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceStatus.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={getStatusColor(service.status)}>
                        {getStatusIcon(service.status)}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{service.name}</h3>
                        <p className="text-gray-400 text-sm">Uptime: {service.uptime}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={service.status === 'healthy' ? 'default' : 'destructive'}>
                        {service.status}
                      </Badge>
                      <p className="text-gray-400 text-sm mt-1">{service.responseTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Alertas */}
        <TabsContent value="alerts" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Alertas del Sistema</CardTitle>
              <CardDescription className="text-gray-400">
                Alertas y notificaciones recientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertsData.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                      alert.type === 'error' ? 'text-red-400' : 
                      alert.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-white">{alert.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getSeverityBadge(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <span className="text-gray-400 text-sm">{alert.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Logs del Sistema</CardTitle>
              <CardDescription className="text-gray-400">
                Logs recientes de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black/50 p-4 rounded-lg font-mono text-sm">
                <div className="space-y-1 text-gray-300">
                  <div>[2024-03-15 14:30:15] INFO: Sistema iniciado correctamente</div>
                  <div>[2024-03-15 14:30:16] INFO: Base de datos conectada</div>
                  <div>[2024-03-15 14:30:17] INFO: Cache Redis inicializado</div>
                  <div>[2024-03-15 14:30:18] WARN: Uso de memoria alto detectado</div>
                  <div>[2024-03-15 14:30:19] INFO: Usuario admin@mpd.gov.ar autenticado</div>
                  <div>[2024-03-15 14:30:20] INFO: Solicitud creada ID: SOL-2024-001</div>
                  <div>[2024-03-15 14:30:21] ERROR: Fallo temporal en servicio de IA</div>
                  <div>[2024-03-15 14:30:22] INFO: Backup automático completado</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
