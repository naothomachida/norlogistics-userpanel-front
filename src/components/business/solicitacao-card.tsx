'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { APP_TEXT, FORMAT_TEXT } from '@/lib/text-constants'
import { cn } from '@/lib/utils'
import { MapPin, DollarSign, Calendar, User, Building2 } from 'lucide-react'

interface SolicitacaoExtended {
  id: string
  numeroOrdem: string
  pontoColeta: string
  pontoEntrega: string
  valorTotal: number
  createdAt: string
  status?: string
  solicitante?: {
    usuario?: {
      nome: string
      email: string
    }
    cliente?: {
      nomeEmpresa: string
    }
  }
}

interface SolicitacaoCardProps {
  solicitacao: SolicitacaoExtended
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  processing?: boolean
  className?: string
  showActions?: boolean
}

export function SolicitacaoCard({
  solicitacao,
  onApprove,
  onReject,
  processing = false,
  className,
  showActions = true
}: SolicitacaoCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = async () => {
    if (onApprove && !isProcessing) {
      setIsProcessing(true)
      try {
        await onApprove(solicitacao.id)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handleReject = async () => {
    if (onReject && !isProcessing) {
      setIsProcessing(true)
      try {
        await onReject(solicitacao.id)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const isDisabled = processing || isProcessing

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {/* Header with Order Number */}
          <div className="flex items-center space-x-3 mb-3">
            <Badge variant="pending" size="sm">
              {solicitacao.numeroOrdem}
            </Badge>
            {solicitacao.status && (
              <Badge variant={solicitacao.status.toLowerCase() as "pending" | "approved" | "rejected"} size="sm">
                {APP_TEXT.STATUS[solicitacao.status as keyof typeof APP_TEXT.STATUS] || solicitacao.status}
              </Badge>
            )}
          </div>

          {/* Company and User Info */}
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-2 text-sm text-gray-900">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="font-medium">
                {solicitacao.solicitante?.cliente?.nomeEmpresa || 'Cliente não informado'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <User className="w-4 h-4 text-gray-400" />
              <span>
                {solicitacao.solicitante?.usuario?.nome || 'Não informado'}
              </span>
            </div>
          </div>

          {/* Route Information */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {solicitacao.pontoColeta} → {solicitacao.pontoEntrega}
            </span>
          </div>

          {/* Value and Date */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="font-medium">
                {FORMAT_TEXT.currency(solicitacao.valorTotal)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                {FORMAT_TEXT.date(solicitacao.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (onApprove || onReject) && (
          <div className="flex items-center space-x-2 ml-4">
            {onApprove && (
              <Button
                onClick={handleApprove}
                disabled={isDisabled}
                variant="success"
                size="sm"
              >
                {isDisabled ? '...' : APP_TEXT.ACTIONS.APPROVE}
              </Button>
            )}
            {onReject && (
              <Button
                onClick={handleReject}
                disabled={isDisabled}
                variant="destructive"
                size="sm"
              >
                {isDisabled ? '...' : APP_TEXT.ACTIONS.REJECT}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}