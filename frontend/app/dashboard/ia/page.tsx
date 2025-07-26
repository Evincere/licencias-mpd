'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain,
  Mail,
  MessageSquare,
  TrendingUp,
  Zap,
  Eye,
  Settings,
  Activity,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { ProcesamientoEmails } from '@/components/ia/procesamiento-emails'
import { AsistenteVirtual } from '@/components/ia/asistente-virtual'
import { AnalisisPredictivo } from '@/components/ia/analisis-predictivo'
import { ConfiguracionFiltrosEmail } from '@/components/ia/configuracion-filtros-email'
import type { DatosExtraidos } from '@/lib/services/ia-procesamiento'

export default function IAPage() {
  // Estados principales
  const [vistaActiva, setVistaActiva] = useState<'procesamiento' | 'asistente' | 'analytics' | 'configuracion'>('procesamiento')
  const [solicitudesProcesadas, setSolicitudesProcesadas] = useState<DatosExtraidos[]>([])

  // Manejar solicitud creada desde procesamiento
  const handleSolicitudCreada = (solicitud: DatosExtraidos) => {
    setSolicitudesProcesadas(prev => [...prev, solicitud])
    // TODO: Integrar con API para crear solicitud real
    console.log('Nueva solicitud creada:', solicitud)
  }

  // Estadísticas simuladas
  const estadisticasIA = {
    emailsProcesados: 247,
    solicitudesExtraidas: 189,
    precisión: 94.2,
    tiempoAhorrado: 156 // horas
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Inteligencia Artificial</h1>
          <p className="text-gray-400 mt-1">
            Procesamiento inteligente y automatización con IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Monitoreo
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-white font-bold text-lg">
                  {estadisticasIA.emailsProcesados}
                </div>
                <div className="text-gray-400 text-xs">Emails Procesados</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-white font-bold text-lg">
                  {estadisticasIA.solicitudesExtraidas}
                </div>
                <div className="text-gray-400 text-xs">Solicitudes Extraídas</div>
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
                  {estadisticasIA.precisión}%
                </div>
                <div className="text-gray-400 text-xs">Precisión IA</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-white font-bold text-lg">
                  {estadisticasIA.tiempoAhorrado}h
                </div>
                <div className="text-gray-400 text-xs">Tiempo Ahorrado</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navegación de funcionalidades */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              variant={vistaActiva === 'procesamiento' ? 'default' : 'outline'}
              onClick={() => setVistaActiva('procesamiento')}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              Procesamiento de Emails
            </Button>
            <Button
              variant={vistaActiva === 'asistente' ? 'default' : 'outline'}
              onClick={() => setVistaActiva('asistente')}
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Asistente Virtual
            </Button>
            <Button
              variant={vistaActiva === 'analytics' ? 'default' : 'outline'}
              onClick={() => setVistaActiva('analytics')}
              className="flex-1"
            >
              <Brain className="w-4 h-4 mr-2" />
              Analytics IA
            </Button>
            <Button
              variant={vistaActiva === 'configuracion' ? 'default' : 'outline'}
              onClick={() => setVistaActiva('configuracion')}
              className="flex-1"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contenido principal */}
      {vistaActiva === 'procesamiento' && (
        <ProcesamientoEmails onSolicitudCreada={handleSolicitudCreada} />
      )}

      {vistaActiva === 'asistente' && (
        <AsistenteVirtual />
      )}

      {vistaActiva === 'analytics' && (
        <AnalisisPredictivo />
      )}

      {vistaActiva === 'configuracion' && (
        <ConfiguracionFiltrosEmail />
      )}

      {/* Solicitudes procesadas recientemente */}
      {solicitudesProcesadas.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Solicitudes Procesadas Recientemente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {solicitudesProcesadas.slice(-5).map((solicitud, index) => (
                <div key={index} className="bg-gray-800/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">
                        {solicitud.empleado.nombre}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {solicitud.licencia.tipo} - {solicitud.licencia.dias} días
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${
                        solicitud.confianza >= 0.8 ? 'bg-green-500/20 text-green-300' :
                        solicitud.confianza >= 0.6 ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {(solicitud.confianza * 100).toFixed(0)}% confianza
                      </Badge>
                      {solicitud.requiereRevision && (
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Revisión
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado del sistema IA */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Estado del Sistema IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Genkit Backend</span>
                <Badge className="bg-yellow-500/20 text-yellow-300">
                  Configurando
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Procesamiento Local</span>
                <Badge className="bg-green-500/20 text-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Activo
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Conectividad Zimbra</span>
                <Badge className="bg-green-500/20 text-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Conectado
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Extracción de Datos</span>
                <Badge className="bg-green-500/20 text-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Operativo
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Análisis Predictivo</span>
                <Badge className="bg-green-500/20 text-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Operativo
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Asistente Virtual</span>
                <Badge className="bg-green-500/20 text-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Operativo
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
