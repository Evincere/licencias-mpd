'use client'

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
  Cell,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts'

interface GraficosAnalyticsProps {
  tipo: 'tendencias' | 'distribucion' | 'tendencias_detallado'
  datos: any
}

export function GraficosAnalytics({ tipo, datos }: GraficosAnalyticsProps) {
  
  // Colores para gráficos
  const COLORES = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#06b6d4', // cyan-500
    '#ec4899', // pink-500
    '#84cc16'  // lime-500
  ]

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/95 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Renderizar gráfico de tendencias simples
  if (tipo === 'tendencias') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={datos.solicitudesMensuales}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="mes" 
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis 
            stroke="#9ca3af"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="valor" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  // Renderizar gráfico de distribución (pie chart)
  if (tipo === 'distribucion') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={datos}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="cantidad"
          >
            {datos.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  // Renderizar gráfico de tendencias detallado (múltiples líneas)
  if (tipo === 'tendencias_detallado') {
    // Combinar datos para el gráfico
    const datosCombinados = datos.solicitudes.map((item: any, index: number) => ({
      mes: item.mes,
      solicitudes: item.valor,
      aprobaciones: datos.aprobaciones[index]?.valor || 0,
      tiempoResolucion: datos.tiempos[index]?.valor || 0
    }))

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={datosCombinados}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="mes" 
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis 
            yAxisId="left"
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            stroke="#9ca3af"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Área para solicitudes */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="solicitudes"
            fill="#3b82f6"
            fillOpacity={0.3}
            stroke="#3b82f6"
            strokeWidth={2}
          />
          
          {/* Línea para aprobaciones */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="aprobaciones"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
          />
          
          {/* Barras para tiempo de resolución */}
          <Bar
            yAxisId="right"
            dataKey="tiempoResolucion"
            fill="#f59e0b"
            fillOpacity={0.7}
            radius={[2, 2, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    )
  }

  return null
}

// Componente para gráfico de barras simple
export function GraficoBarras({ datos, dataKey, color = '#3b82f6' }: {
  datos: any[]
  dataKey: string
  color?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={datos}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="name" 
          stroke="#9ca3af"
          fontSize={12}
        />
        <YAxis 
          stroke="#9ca3af"
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#ffffff'
          }}
        />
        <Bar 
          dataKey={dataKey} 
          fill={color}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Componente para gráfico de área
export function GraficoArea({ datos, dataKey, color = '#3b82f6' }: {
  datos: any[]
  dataKey: string
  color?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={datos}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="name" 
          stroke="#9ca3af"
          fontSize={12}
        />
        <YAxis 
          stroke="#9ca3af"
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#ffffff'
          }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fill={color}
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// Componente para mini gráfico de tendencia
export function MiniGraficoTendencia({ datos, color = '#3b82f6' }: {
  datos: number[]
  color?: string
}) {
  const datosFormateados = datos.map((valor, index) => ({
    index,
    valor
  }))

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={datosFormateados}>
        <Line 
          type="monotone" 
          dataKey="valor" 
          stroke={color} 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
