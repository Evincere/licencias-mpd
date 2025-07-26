'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Settings,
  Mail,
  Filter,
  Plus,
  X,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface FiltroEmail {
  id: string
  nombre: string
  patron: string
  activo: boolean
  tipo: 'remitente' | 'asunto' | 'contenido'
  accion: 'procesar' | 'ignorar' | 'priorizar'
}

interface ConfiguracionFiltros {
  filtrosActivos: FiltroEmail[]
  configuracionGeneral: {
    procesarAutomaticamente: boolean
    requiereConfirmacion: boolean
    notificarProcesamiento: boolean
    umbralConfianza: number
  }
}

export function ConfiguracionFiltrosEmail() {
  // Estados principales
  const [configuracion, setConfiguracion] = useState<ConfiguracionFiltros>({
    filtrosActivos: [
      {
        id: '1',
        nombre: 'Licencias Oficiales',
        patron: '@jus.mendoza.gov.ar',
        activo: true,
        tipo: 'remitente',
        accion: 'procesar'
      },
      {
        id: '2',
        nombre: 'Solicitudes de Licencia',
        patron: 'solicito licencia|solicitud de licencia',
        activo: true,
        tipo: 'asunto',
        accion: 'priorizar'
      },
      {
        id: '3',
        nombre: 'Emails Spam',
        patron: 'promocion|oferta|descuento',
        activo: true,
        tipo: 'contenido',
        accion: 'ignorar'
      }
    ],
    configuracionGeneral: {
      procesarAutomaticamente: true,
      requiereConfirmacion: false,
      notificarProcesamiento: true,
      umbralConfianza: 80
    }
  })

  const [nuevoFiltro, setNuevoFiltro] = useState<Partial<FiltroEmail>>({
    nombre: '',
    patron: '',
    tipo: 'remitente',
    accion: 'procesar',
    activo: true
  })

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [guardando, setGuardando] = useState(false)

  // Agregar nuevo filtro
  const agregarFiltro = () => {
    if (!nuevoFiltro.nombre || !nuevoFiltro.patron) return

    const filtro: FiltroEmail = {
      id: Date.now().toString(),
      nombre: nuevoFiltro.nombre,
      patron: nuevoFiltro.patron,
      tipo: nuevoFiltro.tipo || 'remitente',
      accion: nuevoFiltro.accion || 'procesar',
      activo: nuevoFiltro.activo || true
    }

    setConfiguracion(prev => ({
      ...prev,
      filtrosActivos: [...prev.filtrosActivos, filtro]
    }))

    setNuevoFiltro({
      nombre: '',
      patron: '',
      tipo: 'remitente',
      accion: 'procesar',
      activo: true
    })
    setMostrarFormulario(false)
  }

  // Eliminar filtro
  const eliminarFiltro = (id: string) => {
    setConfiguracion(prev => ({
      ...prev,
      filtrosActivos: prev.filtrosActivos.filter(f => f.id !== id)
    }))
  }

  // Toggle filtro activo
  const toggleFiltro = (id: string) => {
    setConfiguracion(prev => ({
      ...prev,
      filtrosActivos: prev.filtrosActivos.map(f => 
        f.id === id ? { ...f, activo: !f.activo } : f
      )
    }))
  }

  // Guardar configuración
  const guardarConfiguracion = async () => {
    setGuardando(true)
    try {
      // TODO: Implementar guardado real en backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Configuración guardada:', configuracion)
    } catch (error) {
      console.error('Error guardando configuración:', error)
    } finally {
      setGuardando(false)
    }
  }

  // Restaurar configuración por defecto
  const restaurarDefecto = () => {
    setConfiguracion({
      filtrosActivos: [
        {
          id: '1',
          nombre: 'Licencias Oficiales',
          patron: '@jus.mendoza.gov.ar',
          activo: true,
          tipo: 'remitente',
          accion: 'procesar'
        }
      ],
      configuracionGeneral: {
        procesarAutomaticamente: true,
        requiereConfirmacion: false,
        notificarProcesamiento: true,
        umbralConfianza: 80
      }
    })
  }

  // Obtener color de acción
  const obtenerColorAccion = (accion: string): string => {
    switch (accion) {
      case 'procesar': return 'bg-green-500/20 text-green-300'
      case 'priorizar': return 'bg-blue-500/20 text-blue-300'
      case 'ignorar': return 'bg-red-500/20 text-red-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-500/20 rounded-lg">
          <Settings className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Configuración de Filtros de Email</h2>
          <p className="text-gray-400 text-sm">
            Configura reglas para el procesamiento automático de emails
          </p>
        </div>
      </div>

      {/* Configuración General */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Procesamiento Automático</Label>
              <Switch
                checked={configuracion.configuracionGeneral.procesarAutomaticamente}
                onCheckedChange={(checked) => setConfiguracion(prev => ({
                  ...prev,
                  configuracionGeneral: { ...prev.configuracionGeneral, procesarAutomaticamente: checked }
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Requiere Confirmación</Label>
              <Switch
                checked={configuracion.configuracionGeneral.requiereConfirmacion}
                onCheckedChange={(checked) => setConfiguracion(prev => ({
                  ...prev,
                  configuracionGeneral: { ...prev.configuracionGeneral, requiereConfirmacion: checked }
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Notificar Procesamiento</Label>
              <Switch
                checked={configuracion.configuracionGeneral.notificarProcesamiento}
                onCheckedChange={(checked) => setConfiguracion(prev => ({
                  ...prev,
                  configuracionGeneral: { ...prev.configuracionGeneral, notificarProcesamiento: checked }
                }))}
              />
            </div>

            <div>
              <Label className="text-gray-300 text-sm">Umbral de Confianza (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={configuracion.configuracionGeneral.umbralConfianza}
                onChange={(e) => setConfiguracion(prev => ({
                  ...prev,
                  configuracionGeneral: { ...prev.configuracionGeneral, umbralConfianza: parseInt(e.target.value) }
                }))}
                className="mt-1 bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros Activos */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros de Email ({configuracion.filtrosActivos.length})
            </CardTitle>
            <Button
              onClick={() => setMostrarFormulario(true)}
              size="sm"
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Filtro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {configuracion.filtrosActivos.map((filtro) => (
              <div key={filtro.id} className="bg-gray-800/30 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-white font-medium">{filtro.nombre}</div>
                      <Badge className={obtenerColorAccion(filtro.accion)}>
                        {filtro.accion}
                      </Badge>
                      <Badge variant="outline" className="text-gray-400">
                        {filtro.tipo}
                      </Badge>
                    </div>
                    <div className="text-gray-400 text-sm font-mono">
                      {filtro.patron}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={filtro.activo}
                      onCheckedChange={() => toggleFiltro(filtro.id)}
                    />
                    <Button
                      onClick={() => eliminarFiltro(filtro.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {configuracion.filtrosActivos.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay filtros configurados</p>
                <p className="text-sm">Agrega filtros para automatizar el procesamiento</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formulario de nuevo filtro */}
      {mostrarFormulario && (
        <Card className="glass-card border-primary-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Nuevo Filtro</CardTitle>
              <Button
                onClick={() => setMostrarFormulario(false)}
                size="sm"
                variant="ghost"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Nombre del Filtro</Label>
                <Input
                  placeholder="Ej: Emails de RRHH"
                  value={nuevoFiltro.nombre}
                  onChange={(e) => setNuevoFiltro(prev => ({ ...prev, nombre: e.target.value }))}
                  className="mt-1 bg-gray-800/50 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Patrón de Filtro</Label>
                <Input
                  placeholder="Ej: @rrhh.gov.ar o licencia|permiso"
                  value={nuevoFiltro.patron}
                  onChange={(e) => setNuevoFiltro(prev => ({ ...prev, patron: e.target.value }))}
                  className="mt-1 bg-gray-800/50 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Tipo de Filtro</Label>
                <select
                  value={nuevoFiltro.tipo}
                  onChange={(e) => setNuevoFiltro(prev => ({ ...prev, tipo: e.target.value as any }))}
                  className="mt-1 w-full bg-gray-800/50 border border-gray-600 text-white rounded-md px-3 py-2"
                >
                  <option value="remitente">Remitente</option>
                  <option value="asunto">Asunto</option>
                  <option value="contenido">Contenido</option>
                </select>
              </div>

              <div>
                <Label className="text-gray-300">Acción</Label>
                <select
                  value={nuevoFiltro.accion}
                  onChange={(e) => setNuevoFiltro(prev => ({ ...prev, accion: e.target.value as any }))}
                  className="mt-1 w-full bg-gray-800/50 border border-gray-600 text-white rounded-md px-3 py-2"
                >
                  <option value="procesar">Procesar</option>
                  <option value="priorizar">Priorizar</option>
                  <option value="ignorar">Ignorar</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={nuevoFiltro.activo}
                onCheckedChange={(checked) => setNuevoFiltro(prev => ({ ...prev, activo: checked }))}
              />
              <Label className="text-gray-300">Filtro activo</Label>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={agregarFiltro}
                disabled={!nuevoFiltro.nombre || !nuevoFiltro.patron}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Agregar Filtro
              </Button>
              <Button
                onClick={() => setMostrarFormulario(false)}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      <div className="flex gap-3">
        <Button
          onClick={guardarConfiguracion}
          disabled={guardando}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          {guardando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Configuración
            </>
          )}
        </Button>
        
        <Button
          onClick={restaurarDefecto}
          variant="outline"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restaurar por Defecto
        </Button>
      </div>

      {/* Información de ayuda */}
      <Card className="glass-card border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <div className="text-blue-300 font-medium mb-2">Información sobre Patrones</div>
              <div className="text-gray-300 text-sm space-y-1">
                <p>• Usa | para separar múltiples opciones: "licencia|permiso|franco"</p>
                <p>• Los patrones no distinguen mayúsculas y minúsculas</p>
                <p>• Para emails específicos usa el dominio: "@jus.mendoza.gov.ar"</p>
                <p>• Los filtros se evalúan en orden de prioridad</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
