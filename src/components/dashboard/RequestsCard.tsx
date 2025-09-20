'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Clock, TrendingUp, Package, User, MapPin } from 'lucide-react'

interface Request {
  id: string
  numeroOrdem: string
  valorTotal: number
  createdAt: string
  status?: string
  pontoColeta: string
  pontoEntrega: string
  solicitante?: {
    usuario?: {
      nome: string
    }
  }
}

interface RequestsCardProps {
  title: string
  requests: Request[]
  type: 'pending' | 'inProgress'
  maxItems?: number
}

export function RequestsCard({ title, requests, type, maxItems = 5 }: RequestsCardProps) {
  const [showAll, setShowAll] = useState(false)

  const displayedRequests = showAll ? requests : requests.slice(0, maxItems)
  const hasMore = requests.length > maxItems

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'PENDENTE':
        return <Badge variant="pending" size="sm">Pendente</Badge>
      case 'APROVADA':
        return <Badge variant="approved" size="sm">Aprovada</Badge>
      case 'EM_EXECUCAO':
        return <Badge variant="default" size="sm">Em Execução</Badge>
      default:
        return null
    }
  }

  const getIcon = () => {
    return type === 'pending' ? (
      <Clock className="w-5 h-5 text-yellow-600" />
    ) : (
      <TrendingUp className="w-5 h-5 text-blue-600" />
    )
  }

  const totalValue = requests.reduce((sum, req) => sum + req.valorTotal, 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getIcon()}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {requests.length}
            </div>
            <div className="text-sm text-gray-600">
              {formatCurrency(totalValue)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Nenhuma solicitação encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedRequests.map((request) => (
              <div
                key={request.id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {request.numeroOrdem}
                    </span>
                    {request.status && getStatusBadge(request.status)}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(request.valorTotal)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(request.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  {request.solicitante?.usuario?.nome && (
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{request.solicitante.usuario.nome}</span>
                    </div>
                  )}
                  <div className="flex items-start space-x-1">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">
                        <strong>De:</strong> {request.pontoColeta}
                      </div>
                      <div className="truncate">
                        <strong>Para:</strong> {request.pontoEntrega}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {showAll ? 'Ver menos' : `Ver todas (${requests.length})`}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}