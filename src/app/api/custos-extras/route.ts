import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const solicitacaoId = searchParams.get('solicitacaoId')
    
    if (!solicitacaoId) {
      return NextResponse.json(
        { error: 'ID da solicitação é obrigatório' },
        { status: 400 }
      )
    }
    
    const custosExtras = await prisma.custoExtra.findMany({
      where: { solicitacaoId },
      include: {
        solicitacao: {
          select: {
            numeroOrdem: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(custosExtras)
  } catch (error) {
    console.error('Erro ao buscar custos extras:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { solicitacaoId, tipo, valor, observacao } = await request.json()

    if (!solicitacaoId || !tipo || !valor) {
      return NextResponse.json(
        { error: 'Solicitação, tipo e valor são obrigatórios' },
        { status: 400 }
      )
    }

    const custoExtra = await prisma.custoExtra.create({
      data: {
        solicitacaoId,
        tipo,
        valor: parseFloat(valor),
        observacao
      },
      include: {
        solicitacao: {
          select: {
            numeroOrdem: true
          }
        }
      }
    })

    // Atualizar valor total da solicitação
    const custosTotais = await prisma.custoExtra.aggregate({
      where: { solicitacaoId },
      _sum: { valor: true }
    })

    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id: solicitacaoId },
      select: { valorServico: true, valorPedagio: true }
    })

    if (solicitacao) {
      const novoValorTotal = 
        parseFloat(solicitacao.valorServico.toString()) + 
        parseFloat(solicitacao.valorPedagio.toString()) + 
        parseFloat((custosTotais._sum.valor || 0).toString())

      await prisma.solicitacao.update({
        where: { id: solicitacaoId },
        data: { valorTotal: novoValorTotal }
      })
    }

    return NextResponse.json(custoExtra, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar custo extra:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}