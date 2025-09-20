'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface QuantityChartProps {
  data: any[]
  period: 'day' | 'month' | 'year'
  type?: 'line' | 'bar' | 'pie'
  title: string
}

export function QuantityChart({ data, period, type = 'bar', title }: QuantityChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)

    switch (period) {
      case 'day':
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      case 'month':
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      case 'year':
        return date.toLocaleDateString('pt-BR', { month: 'short' })
      default:
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const chartColors = {
    APROVADA: '#10B981',    // green
    PENDENTE: '#F59E0B',    // yellow
    EM_EXECUCAO: '#3B82F6', // blue
    FINALIZADA: '#8B5CF6',  // purple
    REPROVADA: '#EF4444'    // red
  }

  // Para gráfico de pizza, agregamos os dados
  const getPieData = () => {
    const totals = data.reduce((acc, item) => {
      Object.keys(item).forEach(key => {
        if (key !== 'date' && item[key]?.count) {
          acc[key] = (acc[key] || 0) + item[key].count
        }
      })
      return acc
    }, {})

    return Object.entries(totals).map(([status, count]) => ({
      name: status,
      value: count,
      fill: chartColors[status as keyof typeof chartColors] || '#6B7280'
    }))
  }

  if (type === 'pie') {
    const pieData = getPieData()
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === 'line') {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="APROVADA.count"
              stroke={chartColors.APROVADA}
              strokeWidth={2}
              name="Aprovadas"
              dot={{ fill: chartColors.APROVADA, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="PENDENTE.count"
              stroke={chartColors.PENDENTE}
              strokeWidth={2}
              name="Pendentes"
              dot={{ fill: chartColors.PENDENTE, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="EM_EXECUCAO.count"
              stroke={chartColors.EM_EXECUCAO}
              strokeWidth={2}
              name="Em Execução"
              dot={{ fill: chartColors.EM_EXECUCAO, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="APROVADA.count"
            fill={chartColors.APROVADA}
            name="Aprovadas"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            dataKey="PENDENTE.count"
            fill={chartColors.PENDENTE}
            name="Pendentes"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            dataKey="EM_EXECUCAO.count"
            fill={chartColors.EM_EXECUCAO}
            name="Em Execução"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}