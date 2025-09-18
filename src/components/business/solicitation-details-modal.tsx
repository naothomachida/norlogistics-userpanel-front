'use client'

import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { SolicitationMap } from './solicitation-map'
import { APP_TEXT, FORMAT_TEXT } from '@/lib/text-constants'
import {
  MapPin,
  DollarSign,
  Calendar,
  User,
  Building2,
  Package,
  Truck,
  FileText,
  Clock,
  Weight,
  Ruler,
  Hash
} from 'lucide-react'

interface SolicitacaoExtended {
  id: string
  numeroOrdem: string
  pontoColeta: string
  pontoEntrega: string
  pontoRetorno?: string
  enderecoColeta: string
  enderecoEntrega: string
  enderecoRetorno?: string
  dataColeta: string
  horaColeta: string
  dataEntrega: string
  horaEntrega: string
  dataRetorno?: string
  horaRetorno?: string
  descricaoMaterial: string
  quantidadeVolumes: number
  dimensoes: string
  tipoEmbalagem: string
  pesoTotal: number
  numeroDanfe?: string
  valorDanfe?: number
  tipoVeiculo: string
  observacoes?: string
  kmTotal: number
  valorPedagio: number
  valorServico: number
  valorTotal: number
  status: string
  numeroCte?: string
  valorMotorista?: number
  createdAt: string
  updatedAt: string
  solicitante?: {
    usuario?: {
      nome: string
      email: string
    }
    cliente?: {
      nomeEmpresa: string
    }
    centroCusto?: {
      nome: string
      codigo: string
    }
  }
}

interface SolicitationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  solicitacao: SolicitacaoExtended
}

export function SolicitationDetailsModal({
  isOpen,
  onClose,
  solicitacao
}: SolicitationDetailsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalhes da Solicitação - ${solicitacao.numeroOrdem}`}
      size="xl"
    >
      <div className="p-6 space-y-6">
        {/* Status e informações básicas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge variant="pending" size="sm">
              {solicitacao.numeroOrdem}
            </Badge>
            <Badge
              variant={solicitacao.status.toLowerCase() as "pending" | "approved" | "rejected"}
              size="sm"
            >
              {APP_TEXT.STATUS[solicitacao.status as keyof typeof APP_TEXT.STATUS] || solicitacao.status}
            </Badge>
          </div>
          <div className="text-sm text-gray-500">
            Criado em {FORMAT_TEXT.date(solicitacao.createdAt)}
          </div>
        </div>

        {/* Informações do solicitante */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-gray-400" />
              Informações do Solicitante
            </h3>

            <div className="space-y-2 pl-7">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="font-medium">
                  {solicitacao.solicitante?.cliente?.nomeEmpresa || 'Não informado'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span>
                  {solicitacao.solicitante?.usuario?.nome || 'Não informado'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span>
                  {solicitacao.solicitante?.centroCusto?.nome || 'Não informado'}
                  {solicitacao.solicitante?.centroCusto?.codigo &&
                    ` (${solicitacao.solicitante.centroCusto.codigo})`
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-gray-400" />
              Valores
            </h3>

            <div className="space-y-2 pl-7">
              <div className="flex justify-between">
                <span>Serviço:</span>
                <span className="font-medium">{FORMAT_TEXT.currency(solicitacao.valorServico)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pedágio:</span>
                <span className="font-medium">{FORMAT_TEXT.currency(solicitacao.valorPedagio)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">{FORMAT_TEXT.currency(solicitacao.valorTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>KM Total:</span>
                <span>{solicitacao.kmTotal} km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-gray-400" />
            Localização no Mapa
          </h3>
          <SolicitationMap
            origem={solicitacao.pontoColeta}
            destino={solicitacao.pontoEntrega}
            retorno={solicitacao.pontoRetorno}
            className="border border-gray-200"
          />
        </div>

        {/* Detalhes da rota */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-gray-400" />
            Detalhes da Rota
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
            {/* Coleta */}
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">📍 Coleta</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Local:</strong> {solicitacao.pontoColeta}</div>
                <div><strong>Endereço:</strong> {solicitacao.enderecoColeta}</div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{FORMAT_TEXT.date(solicitacao.dataColeta)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{solicitacao.horaColeta}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Entrega */}
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">📍 Entrega</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Local:</strong> {solicitacao.pontoEntrega}</div>
                <div><strong>Endereço:</strong> {solicitacao.enderecoEntrega}</div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{FORMAT_TEXT.date(solicitacao.dataEntrega)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{solicitacao.horaEntrega}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Retorno (se existir) */}
            {solicitacao.pontoRetorno && (
              <div className="space-y-2 md:col-span-2">
                <h4 className="font-medium text-red-600">📍 Retorno</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Local:</strong> {solicitacao.pontoRetorno}</div>
                  <div><strong>Endereço:</strong> {solicitacao.enderecoRetorno}</div>
                  {solicitacao.dataRetorno && (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{FORMAT_TEXT.date(solicitacao.dataRetorno)}</span>
                      </div>
                      {solicitacao.horaRetorno && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{solicitacao.horaRetorno}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informações da carga */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2 text-gray-400" />
              Informações da Carga
            </h3>

            <div className="space-y-2 pl-7">
              <div><strong>Descrição:</strong> {solicitacao.descricaoMaterial}</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span>{solicitacao.quantidadeVolumes} volumes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Weight className="w-4 h-4 text-gray-400" />
                  <span>{solicitacao.pesoTotal} kg</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Ruler className="w-4 h-4 text-gray-400" />
                <span>{solicitacao.dimensoes}</span>
              </div>
              <div><strong>Embalagem:</strong> {solicitacao.tipoEmbalagem}</div>

              {solicitacao.numeroDanfe && (
                <div className="mt-2 pt-2 border-t">
                  <div><strong>DANFE:</strong> {solicitacao.numeroDanfe}</div>
                  {solicitacao.valorDanfe && (
                    <div><strong>Valor DANFE:</strong> {FORMAT_TEXT.currency(solicitacao.valorDanfe)}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-gray-400" />
              Informações do Transporte
            </h3>

            <div className="space-y-2 pl-7">
              <div><strong>Tipo de Veículo:</strong> {solicitacao.tipoVeiculo}</div>

              {solicitacao.numeroCte && (
                <div><strong>CTe:</strong> {solicitacao.numeroCte}</div>
              )}

              {solicitacao.valorMotorista && (
                <div><strong>Valor Motorista:</strong> {FORMAT_TEXT.currency(solicitacao.valorMotorista)}</div>
              )}

              {solicitacao.observacoes && (
                <div className="mt-3 pt-3 border-t">
                  <strong>Observações:</strong>
                  <p className="mt-1 text-sm text-gray-600">{solicitacao.observacoes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}