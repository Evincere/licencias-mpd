'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft,
  Settings,
  Palette,
  Bell,
  Shield,
  Save,
  Plus,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { CalendarioService } from '@/lib/api/calendario'
import type { 
  ConfiguracionCalendario,
  AlertaCalendario,
  ReglaConflicto,
  TipoEventoCalendario,
  EstadoEventoCalendario
} from '@/lib/types/calendario'
import { 
  TIPOS_EVENTO,
  ESTADOS_EVENTO,
  COLORES_TIPO_DEFECTO,
  COLORES_ESTADO_DEFECTO
} from '@/lib/types/calendario'

export default function ConfiguracionCalendarioPage() {
  const router = useRouter()
  
  // Estados principales
  const [configuracion, setConfiguracion] = useState<ConfiguracionCalendario | null>(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cambiosPendientes, setCambiosPendientes] = useState(false)

  // Cargar configuración
  const cargarConfiguracion = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const config = await CalendarioService.obtenerConfiguracion()
      setConfiguracion(config)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuración')
      console.error('Error cargando configuración:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarConfiguracion()
  }, [])

  // Manejar cambios en la configuración
  const handleConfigChange = (campo: keyof ConfiguracionCalendario, valor: any) => {
    if (!configuracion) return
    
    setConfiguracion(prev => ({
      ...prev!,
      [campo]: valor
    }))
    setCambiosPendientes(true)
  }

  // Manejar cambios en colores
  const handleColorChange = (tipo: 'tipo' | 'estado', key: string, color: string) => {
    if (!configuracion) return
    
    const campo = tipo === 'tipo' ? 'coloresPorTipo' : 'coloresPorEstado'
    setConfiguracion(prev => ({
      ...prev!,
      [campo]: {
        ...prev![campo],
        [key]: color
      }
    }))
    setCambiosPendientes(true)
  }

  // Agregar nueva alerta
  const agregarAlerta = () => {
    if (!configuracion) return
    
    const nuevaAlerta: AlertaCalendario = {
      id: Date.now().toString(),
      nombre: 'Nueva Alerta',
      tipo: 'cobertura_minima',
      condicion: { umbral: 70 },
      activa: true,
      destinatarios: []
    }
    
    setConfiguracion(prev => ({
      ...prev!,
      alertas: [...prev!.alertas, nuevaAlerta]
    }))
    setCambiosPendientes(true)
  }

  // Eliminar alerta
  const eliminarAlerta = (id: string) => {
    if (!configuracion) return
    
    setConfiguracion(prev => ({
      ...prev!,
      alertas: prev!.alertas.filter(a => a.id !== id)
    }))
    setCambiosPendientes(true)
  }

  // Agregar nueva regla de conflicto
  const agregarRegla = () => {
    if (!configuracion) return
    
    const nuevaRegla: ReglaConflicto = {
      id: Date.now().toString(),
      nombre: 'Nueva Regla',
      descripcion: 'Descripción de la regla',
      tipo: 'area_cobertura',
      parametros: { minimo: 2 },
      activa: true,
      severidad: 'warning'
    }
    
    setConfiguracion(prev => ({
      ...prev!,
      reglasConflicto: [...prev!.reglasConflicto, nuevaRegla]
    }))
    setCambiosPendientes(true)
  }

  // Eliminar regla
  const eliminarRegla = (id: string) => {
    if (!configuracion) return
    
    setConfiguracion(prev => ({
      ...prev!,
      reglasConflicto: prev!.reglasConflicto.filter(r => r.id !== id)
    }))
    setCambiosPendientes(true)
  }

  // Guardar configuración
  const guardarConfiguracion = async () => {
    if (!configuracion) return
    
    try {
      setGuardando(true)
      setError(null)
      
      // TODO: Implementar endpoint para guardar configuración
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular guardado
      
      setCambiosPendientes(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar configuración')
    } finally {
      setGuardando(false)
    }
  }

  // Restablecer valores por defecto
  const restablecerDefecto = () => {
    if (!configuracion) return
    
    setConfiguracion(prev => ({
      ...prev!,
      coloresPorTipo: { ...COLORES_TIPO_DEFECTO },
      coloresPorEstado: { ...COLORES_ESTADO_DEFECTO }
    }))
    setCambiosPendientes(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-white">Configuración del Calendario</h1>
        </div>
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
              <span className="ml-3 text-gray-300">Cargando configuración...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!configuracion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-white">Error</h1>
        </div>
        <Card className="glass-card border-red-500/30">
          <CardContent className="p-8">
            <div className="flex items-center text-red-400">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error || 'No se pudo cargar la configuración'}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Configuración del Calendario</h1>
            <p className="text-gray-400 mt-1">Personaliza la apariencia y comportamiento del calendario</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={guardarConfiguracion}
            disabled={!cambiosPendientes || guardando}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="glass-card border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center text-red-400">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cambios pendientes */}
      {cambiosPendientes && (
        <Card className="glass-card border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center text-yellow-400">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Hay cambios sin guardar
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración general */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vistaDefecto" className="text-gray-300">
                Vista por Defecto
              </Label>
              <select
                id="vistaDefecto"
                value={configuracion.vistaDefecto}
                onChange={(e) => handleConfigChange('vistaDefecto', e.target.value)}
                className="w-full mt-1 p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white"
              >
                <option value="mes">Vista Mensual</option>
                <option value="semana">Vista Semanal</option>
                <option value="dia">Vista Diaria</option>
                <option value="agenda">Vista Agenda</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="horaInicio" className="text-gray-300">
                  Hora de Inicio
                </Label>
                <Input
                  id="horaInicio"
                  type="number"
                  min="0"
                  max="23"
                  value={configuracion.horaInicio}
                  onChange={(e) => handleConfigChange('horaInicio', parseInt(e.target.value))}
                  className="mt-1 bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="horaFin" className="text-gray-300">
                  Hora de Fin
                </Label>
                <Input
                  id="horaFin"
                  type="number"
                  min="0"
                  max="23"
                  value={configuracion.horaFin}
                  onChange={(e) => handleConfigChange('horaFin', parseInt(e.target.value))}
                  className="mt-1 bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300">
                <input
                  type="checkbox"
                  checked={configuracion.mostrarFinDeSemana}
                  onChange={(e) => handleConfigChange('mostrarFinDeSemana', e.target.checked)}
                  className="mr-2"
                />
                Mostrar fines de semana
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de colores */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Colores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">Colores por Tipo</h4>
                <Button
                  onClick={restablecerDefecto}
                  variant="outline"
                  size="sm"
                >
                  Restablecer
                </Button>
              </div>
              <div className="space-y-2">
                {Object.entries(TIPOS_EVENTO).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">{label}</span>
                    <input
                      type="color"
                      value={configuracion.coloresPorTipo[key as TipoEventoCalendario]}
                      onChange={(e) => handleColorChange('tipo', key, e.target.value)}
                      className="w-8 h-8 rounded border border-gray-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">Colores por Estado</h4>
              <div className="space-y-2">
                {Object.entries(ESTADOS_EVENTO).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">{label}</span>
                    <input
                      type="color"
                      value={configuracion.coloresPorEstado[key as EstadoEventoCalendario]}
                      onChange={(e) => handleColorChange('estado', key, e.target.value)}
                      className="w-8 h-8 rounded border border-gray-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alertas del Calendario
            </CardTitle>
            <Button onClick={agregarAlerta} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Alerta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {configuracion.alertas.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No hay alertas configuradas
            </div>
          ) : (
            <div className="space-y-3">
              {configuracion.alertas.map((alerta) => (
                <div key={alerta.id} className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{alerta.nombre}</div>
                      <div className="text-gray-400 text-sm">
                        Tipo: {alerta.tipo} • {alerta.activa ? 'Activa' : 'Inactiva'}
                      </div>
                    </div>
                    <Button
                      onClick={() => eliminarAlerta(alerta.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reglas de conflicto */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Reglas de Conflicto
            </CardTitle>
            <Button onClick={agregarRegla} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Regla
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {configuracion.reglasConflicto.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No hay reglas de conflicto configuradas
            </div>
          ) : (
            <div className="space-y-3">
              {configuracion.reglasConflicto.map((regla) => (
                <div key={regla.id} className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{regla.nombre}</div>
                      <div className="text-gray-400 text-sm">{regla.descripcion}</div>
                      <div className="text-gray-400 text-sm">
                        Tipo: {regla.tipo} • Severidad: {regla.severidad} • {regla.activa ? 'Activa' : 'Inactiva'}
                      </div>
                    </div>
                    <Button
                      onClick={() => eliminarRegla(regla.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
