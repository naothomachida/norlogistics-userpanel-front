'use client'

import { useState } from 'react'
import { CalendarDays, Calendar, CalendarIcon } from 'lucide-react'

interface PeriodFilterProps {
  currentPeriod: 'day' | 'month' | 'year'
  onChange: (period: 'day' | 'month' | 'year') => void
}

export function PeriodFilter({ currentPeriod, onChange }: PeriodFilterProps) {
  const periods = [
    {
      value: 'day' as const,
      label: 'Hoje',
      icon: CalendarDays,
      description: 'Dados do dia atual'
    },
    {
      value: 'month' as const,
      label: 'Mês',
      icon: Calendar,
      description: 'Dados do mês atual'
    },
    {
      value: 'year' as const,
      label: 'Ano',
      icon: CalendarIcon,
      description: 'Dados do ano atual'
    }
  ]

  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      {periods.map((period) => {
        const Icon = period.icon
        const isActive = currentPeriod === period.value

        return (
          <button
            key={period.value}
            onClick={() => onChange(period.value)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              isActive
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            title={period.description}
          >
            <Icon className="w-4 h-4" />
            <span>{period.label}</span>
          </button>
        )
      })}
    </div>
  )
}