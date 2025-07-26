'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Filter,
  X,
  Calendar,
  Users,
  Building,
  FileText,
  RotateCcw
} from 'lucide-react'
import type { FiltrosReporte } from '@/lib/types/reportes'

interface FiltrosAnalyticsProps {
  filtros: FiltrosReporte
  onChange: (filtros: FiltrosReporte) => void
  onClose: () => void
}

export function FiltrosAnalytics({ filtros, onChange, onClose }: FiltrosAnalyticsProps) {
  const [filtrosLocales, setFiltrosLocales] = useState<FiltrosReporte>(filtros)

  // Aplicar filtros
  const aplicarFiltros = () => {
    onChange(filtrosLocales)
    onClose()
  }

  // Limpiar filtros
  const limpiarFiltros = () => {
    const filtrosVacios: FiltrosReporte = {
      fechaInicio: new Date(new Date().getFullYear(), 0, 1),
      fechaFin: new Date(),
      areas: [],
      empleados: [],
      tiposLicencia: [],
      estados: [],
      jerarquias: []
    }
    setFiltrosLocales(filtrosVacios)
  }

  // Rangos de fecha predefinidos
  const aplicarRangoFecha = (tipo: string) => {
    const hoy = new Date()
    let fechaInicio: Date
    let fechaFin: Date = new Date(hoy)

    switch (tipo) {
      case 'hoy':
        fechaInicio = new Date(hoy)
        break
      case 'semana':
        fechaInicio = new Date(hoy)
        fechaInicio.setDate(hoy.getDate() - 7)
        break
      case 'mes':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
        break
      case 'trimestre':
        fechaInicio = new Date(hoy.getFullYear(), Math.floor(hoy.getMonth() / 3) * 3, 1)
        break
      case 'año':
        fechaInicio = new Date(hoy.getFullYear(), 0, 1)
        break
      case 'año_anterior':
        fechaInicio = new Date(hoy.getFullYear() - 1, 0, 1)
        fechaFin = new Date(hoy.getFullYear() - 1, 11, 31)
        break
      default:
        return
    }

    setFiltrosLocales(prev => ({
      ...prev,
      fechaInicio,
      fechaFin
    }))
  }

  // Agregar/quitar elemento de array
  const toggleArrayItem = (array: string[] | undefined, item: string): string[] => {
    const currentArray = array || []
    if (currentArray.includes(item)) {
      return currentArray.filter(i => i !== item)
    } else {
      return [...currentArray, item]
    }
  }

  // Opciones predefinidas
  const areasDisponibles = [
    'Defensoría Penal',
    'Defensoría Civil',
    'Administración',
    'Recursos Humanos',
    'Sistemas',
    'Contaduría'
  ]

  const tiposLicenciaDisponibles = [
    'Licencia Anual',
    'Licencia por Enfermedad',
    'Licencia Compensatoria',
    'Licencia Especial',
    'Licencia de Maternidad',
    'Licencia de Paternidad'
  ]

  const estadosDisponibles = [
    'Pendiente',
    'Aprobada',
    'Rechazada',
    'En Revisión'
  ]

  const jerarquiasDisponibles = [
    'MAGISTRADO',
    'FUNCIONARIO',
    'EMPLEADO'
  ]

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros Avanzados
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Rango de Fechas */}
        <div className="space-y-3">
          <Label className="text-gray-300 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Período de Análisis
          </Label>
          
          {/* Rangos predefinidos */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'hoy', label: 'Hoy' },
              { key: 'semana', label: 'Última Semana' },
              { key: 'mes', label: 'Este Mes' },
              { key: 'trimestre', label: 'Este Trimestre' },
              { key: 'año', label: 'Este Año' },
              { key: 'año_anterior', label: 'Año Anterior' }
            ].map(rango => (
              <Button
                key={rango.key}
                variant="outline"
                size="sm"
                onClick={() => aplicarRangoFecha(rango.key)}
                className="text-xs"
              >
                {rango.label}
              </Button>
            ))}
          </div>
          
          {/* Fechas personalizadas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fechaInicio" className="text-gray-300 text-sm">
                Fecha de Inicio
              </Label>
              <Input
                id="fechaInicio"
                type="date"
                value={filtrosLocales.fechaInicio.toISOString().split('T')[0]}
                onChange={(e) => setFiltrosLocales(prev => ({
                  ...prev,
                  fechaInicio: new Date(e.target.value)
                }))}
                className="mt-1 bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="fechaFin" className="text-gray-300 text-sm">
                Fecha de Fin
              </Label>
              <Input
                id="fechaFin"
                type="date"
                value={filtrosLocales.fechaFin.toISOString().split('T')[0]}
                onChange={(e) => setFiltrosLocales(prev => ({
                  ...prev,
                  fechaFin: new Date(e.target.value)
                }))}
                className="mt-1 bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
          </div>
        </div>

        {/* Áreas */}
        <div className="space-y-3">
          <Label className="text-gray-300 flex items-center gap-2">
            <Building className="w-4 h-4" />
            Áreas
          </Label>
          <div className="flex flex-wrap gap-2">
            {areasDisponibles.map(area => (
              <Badge
                key={area}
                variant={filtrosLocales.areas?.includes(area) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary-600"
                onClick={() => setFiltrosLocales(prev => ({
                  ...prev,
                  areas: toggleArrayItem(prev.areas, area)
                }))}
              >
                {area}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tipos de Licencia */}
        <div className="space-y-3">
          <Label className="text-gray-300 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Tipos de Licencia
          </Label>
          <div className="flex flex-wrap gap-2">
            {tiposLicenciaDisponibles.map(tipo => (
              <Badge
                key={tipo}
                variant={filtrosLocales.tiposLicencia?.includes(tipo) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary-600"
                onClick={() => setFiltrosLocales(prev => ({
                  ...prev,
                  tiposLicencia: toggleArrayItem(prev.tiposLicencia, tipo)
                }))}
              >
                {tipo}
              </Badge>
            ))}
          </div>
        </div>

        {/* Estados */}
        <div className="space-y-3">
          <Label className="text-gray-300">Estados</Label>
          <div className="flex flex-wrap gap-2">
            {estadosDisponibles.map(estado => (
              <Badge
                key={estado}
                variant={filtrosLocales.estados?.includes(estado) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary-600"
                onClick={() => setFiltrosLocales(prev => ({
                  ...prev,
                  estados: toggleArrayItem(prev.estados, estado)
                }))}
              >
                {estado}
              </Badge>
            ))}
          </div>
        </div>

        {/* Jerarquías */}
        <div className="space-y-3">
          <Label className="text-gray-300 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Jerarquías
          </Label>
          <div className="flex flex-wrap gap-2">
            {jerarquiasDisponibles.map(jerarquia => (
              <Badge
                key={jerarquia}
                variant={filtrosLocales.jerarquias?.includes(jerarquia) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary-600"
                onClick={() => setFiltrosLocales(prev => ({
                  ...prev,
                  jerarquias: toggleArrayItem(prev.jerarquias, jerarquia)
                }))}
              >
                {jerarquia}
              </Badge>
            ))}
          </div>
        </div>

        {/* Resumen de filtros activos */}
        {(filtrosLocales.areas?.length || filtrosLocales.tiposLicencia?.length || 
          filtrosLocales.estados?.length || filtrosLocales.jerarquias?.length) && (
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="text-gray-300 text-sm mb-2">Filtros Activos:</div>
            <div className="text-gray-400 text-xs">
              {filtrosLocales.areas?.length && `${filtrosLocales.areas.length} áreas, `}
              {filtrosLocales.tiposLicencia?.length && `${filtrosLocales.tiposLicencia.length} tipos, `}
              {filtrosLocales.estados?.length && `${filtrosLocales.estados.length} estados, `}
              {filtrosLocales.jerarquias?.length && `${filtrosLocales.jerarquias.length} jerarquías`}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={limpiarFiltros}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Limpiar
          </Button>
          <Button
            onClick={aplicarFiltros}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
          >
            <Filter className="w-4 h-4 mr-2" />
            Aplicar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
