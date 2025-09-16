import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clienteId = searchParams.get('clienteId')
    
    const whereClause = clienteId ? { clienteId, ativo: true } : { ativo: true }
    
    const centrosCusto = await prisma.centroCusto.findMany({
      where: whereClause,
      include: {
        cliente: {
          select: {
            id: true,
            nomeEmpresa: true
          }
        },
        _count: {
          select: {
            solicitantes: true,
            solicitacoes: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    })

    return NextResponse.json(centrosCusto)
  } catch (error) {
    console.error('Erro ao buscar centros de custo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nome, codigo, clienteId } = await request.json()

    if (!nome || !codigo || !clienteId) {
      return NextResponse.json(
        { error: 'Nome, código e cliente são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se código já existe para o cliente
    const existingCentroCusto = await prisma.centroCusto.findFirst({
      where: {
        codigo,
        clienteId
      }
    })

    if (existingCentroCusto) {
      return NextResponse.json(
        { error: 'Código já existe para este cliente' },
        { status: 400 }
      )
    }

    const centroCusto = await prisma.centroCusto.create({
      data: {
        nome,
        codigo,
        clienteId
      },
      include: {
        cliente: {
          select: {
            id: true,
            nomeEmpresa: true
          }
        }
      }
    })

    return NextResponse.json(centroCusto, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar centro de custo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}