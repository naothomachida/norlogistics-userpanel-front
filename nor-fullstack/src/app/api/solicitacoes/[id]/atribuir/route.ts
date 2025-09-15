import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { transportadorId, motoristaId, veiculoId, numeroCte, valorMotorista } = await request.json()

    if (!transportadorId || !motoristaId || !veiculoId) {
      return NextResponse.json(
        { error: 'Transportador, motorista e veículo são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se solicitação existe e está aprovada
    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id: params.id }
    })

    if (!solicitacao) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      )
    }

    if (solicitacao.status !== 'APROVADA') {
      return NextResponse.json(
        { error: 'Solicitação deve estar aprovada para ser atribuída' },
        { status: 400 }
      )
    }

    // Atualizar solicitação com atribuições
    const solicitacaoAtualizada = await prisma.solicitacao.update({
      where: { id: params.id },
      data: {
        transportadorId,
        motoristaId,
        veiculoId,
        numeroCte,
        valorMotorista: valorMotorista ? parseFloat(valorMotorista) : null,
        status: 'EM_EXECUCAO'
      },
      include: {
        transportador: {
          include: {
            usuario: {
              select: {
                nome: true
              }
            }
          }
        },
        motorista: {
          include: {
            usuario: {
              select: {
                nome: true,
                telefone: true
              }
            }
          }
        },
        veiculo: true
      }
    })

    // Criar registro de viagem
    await prisma.viagem.create({
      data: {
        solicitacaoId: params.id,
        motoristaId,
        veiculoId
      }
    })

    return NextResponse.json(solicitacaoAtualizada)
  } catch (error) {
    console.error('Erro ao atribuir solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}