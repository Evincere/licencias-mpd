'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, StatusBadge, MetricBadge } from '@/components/ui/badge'
import { MetricTooltip, InfoTooltip } from '@/components/ui/tooltip'
import { SemanticAlert } from '@/components/ui/alert'
import { CalendarioCompactoComponent } from '@/components/dashboard/calendario-compacto'
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Plus,
  Settings,
  BarChart3,
  Eye,
  TrendingDown
} from 'lucide-react'

// Mock data - En producción esto vendría de la API
const mockStats = {
  totalEmpleados: 156,
  solicitudesPendientes: 23,
  solicitudesAprobadas: 89,
  solicitudesRechazadas: 12,
}

const mockRecentSolicitudes = [
  {
    id: 1,
    empleado: 'Juan Pérez',
    tipo: 'Vacaciones',
    fechaInicio: '2025-08-01',
    estado: 'pendiente',
  },
  {
    id: 2,
    empleado: 'María García',
    tipo: 'Licencia médica',
    fechaInicio: '2025-07-25',
    estado: 'aprobada',
  },
  {
    id: 3,
    empleado: 'Carlos López',
    tipo: 'Licencia personal',
    fechaInicio: '2025-07-30',
    estado: 'en_revision',
  },
]

export default function DashboardPage() {
  const { user } = useAuth()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'text-yellow-400'
      case 'aprobada':
        return 'text-green-400'
      case 'rechazada':
        return 'text-red-400'
      case 'en_revision':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Clock className="w-4 h-4" />
      case 'aprobada':
        return <CheckCircle className="w-4 h-4" />
      case 'rechazada':
        return <XCircle className="w-4 h-4" />
      case 'en_revision':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-info-400 to-info-600 bg-clip-text text-transparent">
              {getGreeting()}, {user?.nombre}
            </h1>
            <p className="text-neutral-300 mt-1">
              Bienvenido al Sistema de Licencias del MPD
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-neutral-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('es-AR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards - Mejoradas con colores semánticos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricTooltip
          metric="Total Empleados"
          value={mockStats.totalEmpleados}
          description="Número total de empleados registrados en el sistema"
          trend="up"
          comparison="+2.1% desde el mes pasado"
        >
          <Card className="glass-card glass-hover border-info-500/20 bg-info-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-info-200">Total Empleados</CardTitle>
              <Users className="h-4 w-4 text-info-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info-100">{mockStats.totalEmpleados}</div>
              <p className="text-xs text-info-300 flex items-center">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                +2.1% desde el mes pasado
              </p>
            </CardContent>
          </Card>
        </MetricTooltip>

        <MetricTooltip
          metric="Solicitudes Pendientes"
          value={mockStats.solicitudesPendientes}
          description="Solicitudes que requieren revisión y aprobación"
          trend="stable"
          comparison="Sin cambios significativos"
        >
          <Card className="glass-card glass-hover border-warning-500/20 bg-warning-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-warning-200">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-warning-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning-100">{mockStats.solicitudesPendientes}</div>
              <p className="text-xs text-warning-300">
                Requieren revisión
              </p>
            </CardContent>
          </Card>
        </MetricTooltip>

        <MetricTooltip
          metric="Solicitudes Aprobadas"
          value={mockStats.solicitudesAprobadas}
          description="Solicitudes aprobadas exitosamente este mes"
          trend="up"
          comparison="+15% vs mes anterior"
        >
          <Card className="glass-card glass-hover border-success-500/20 bg-success-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-success-200">Aprobadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-success-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success-100">{mockStats.solicitudesAprobadas}</div>
              <p className="text-xs text-success-300 flex items-center">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                +15% este mes
              </p>
            </CardContent>
          </Card>
        </MetricTooltip>

        <MetricTooltip
          metric="Solicitudes Rechazadas"
          value={mockStats.solicitudesRechazadas}
          description="Solicitudes rechazadas este mes"
          trend="down"
          comparison="-8% vs mes anterior"
        >
          <Card className="glass-card glass-hover border-danger-500/20 bg-danger-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-danger-200">Rechazadas</CardTitle>
              <XCircle className="h-4 w-4 text-danger-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-danger-100">{mockStats.solicitudesRechazadas}</div>
              <p className="text-xs text-danger-300 flex items-center">
                <TrendingDown className="inline w-3 h-3 mr-1" />
                -8% este mes
              </p>
            </CardContent>
          </Card>
        </MetricTooltip>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Solicitudes - Mejoradas con badges semánticos */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-info-400" />
              <span className="text-info-100">Solicitudes Recientes</span>
            </CardTitle>
            <CardDescription className="text-info-300">
              Últimas solicitudes de licencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentSolicitudes.map((solicitud) => (
                <InfoTooltip
                  key={solicitud.id}
                  title={`Solicitud de ${solicitud.tipo}`}
                  description={`Empleado: ${solicitud.empleado} | Fecha inicio: ${solicitud.fechaInicio}`}
                  variant="info"
                >
                  <div className="flex items-center justify-between p-3 glass-card bg-opacity-30 hover:bg-opacity-50 transition-all cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className={`${getStatusColor(solicitud.estado)}`}>
                        {getStatusIcon(solicitud.estado)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{solicitud.empleado}</p>
                        <p className="text-xs text-neutral-400">
                          {solicitud.tipo} - {solicitud.fechaInicio}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      status={solicitud.estado as 'pendiente' | 'aprobada' | 'rechazada' | 'en_revision'}
                      showIcon={false}
                    />
                  </div>
                </InfoTooltip>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="ghost" className="w-full hover:bg-glass-hover text-info-200 hover:text-info-100">
                Ver todas las solicitudes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Mejoradas con colores semánticos diferenciados */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-neutral-100">Acciones Rápidas</CardTitle>
            <CardDescription className="text-neutral-300">
              Tareas frecuentes del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <InfoTooltip
                title="Nueva Solicitud"
                description="Crear una nueva solicitud de licencia para cualquier empleado"
                variant="success"
              >
                <div className="quick-action-button success-action group">
                  <div className="flex items-center space-x-3">
                    <div className="quick-action-icon">
                      <Plus />
                    </div>
                    <div>
                      <p className="quick-action-title">Nueva Solicitud</p>
                      <p className="quick-action-subtitle">Crear solicitud de licencia</p>
                    </div>
                  </div>
                </div>
              </InfoTooltip>

              <InfoTooltip
                title="Gestionar Empleados"
                description="Ver, editar y administrar la información de todos los empleados"
                variant="info"
              >
                <div className="quick-action-button info-action group">
                  <div className="flex items-center space-x-3">
                    <div className="quick-action-icon">
                      <Users />
                    </div>
                    <div>
                      <p className="quick-action-title">Gestionar Empleados</p>
                      <p className="quick-action-subtitle">Ver y editar empleados</p>
                    </div>
                  </div>
                </div>
              </InfoTooltip>

              <InfoTooltip
                title="Ver Reportes"
                description="Acceder a estadísticas, métricas y reportes del sistema"
                variant="info"
              >
                <div className="quick-action-button analytics-action group">
                  <div className="flex items-center space-x-3">
                    <div className="quick-action-icon">
                      <BarChart3 />
                    </div>
                    <div>
                      <p className="quick-action-title">Ver Reportes</p>
                      <p className="quick-action-subtitle">Estadísticas y métricas</p>
                    </div>
                  </div>
                </div>
              </InfoTooltip>
            </div>
          </CardContent>
        </Card>

        {/* Calendario Compacto */}
        <CalendarioCompactoComponent />
      </div>
    </div>
  )
}
