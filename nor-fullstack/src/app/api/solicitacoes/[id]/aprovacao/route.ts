import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { gestorId, aprovada, observacao } = await request.json()

    if (!gestorId || typeof aprovada !== 'boolean') {
      return NextResponse.json(
        { error: 'Gestor ID e status de aprovação são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se solicitação existe
    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id: params.id }
    })

    if (!solicitacao) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      )
    }

    if (solicitacao.status !== 'PENDENTE') {
      return NextResponse.json(
        { error: 'Solicitação já foi processada' },
        { status: 400 }
      )
    }

    // Criar aprovação e atualizar status da solicitação em transação
    const resultado = await prisma.$transaction(async (tx) => {
      // Criar registro de aprovação
      const aprovacao = await tx.aprovacao.create({
        data: {
          solicitacaoId: params.id,
          gestorId,
          aprovada,
          observacao
        }
      })

      // Atualizar status da solicitação
      const solicitacaoAtualizada = await tx.solicitacao.update({
        where: { id: params.id },
        data: {
          status: aprovada ? 'APROVADA' : 'REPROVADA'
        },
        include: {
          solicitante: {
            include: {
              usuario: {
                select: {
                  nome: true,
                  email: true
                }
              }
            }
          },
          gestor: {
            include: {
              usuario: {
                select: {
                  nome: true
                }
              }
            }
          },
          aprovacao: true
        }
      })

      return { aprovacao, solicitacao: solicitacaoAtualizada }
    })

    return NextResponse.json(resultado)
  } catch (error) {
    console.error('Erro ao processar aprovação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}