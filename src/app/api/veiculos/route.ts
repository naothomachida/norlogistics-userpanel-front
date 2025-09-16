import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const transportadorId = searchParams.get('transportadorId')
    
    const whereClause = transportadorId 
      ? { transportadorId, ativo: true } 
      : { ativo: true }
    
    const veiculos = await prisma.veiculo.findMany({
      where: whereClause,
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
        _count: {
          select: {
            solicitacoes: true,
            viagens: true,
            manutencoes: true
          }
        }
      },
      orderBy: { placa: 'asc' }
    })

    return NextResponse.json(veiculos)
  } catch (error) {
    console.error('Erro ao buscar veículos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { placa, modelo, tipo, capacidade, transportadorId } = await request.json()

    if (!placa || !modelo || !tipo || !capacidade || !transportadorId) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se placa já existe
    const existingVeiculo = await prisma.veiculo.findUnique({
      where: { placa }
    })

    if (existingVeiculo) {
      return NextResponse.json(
        { error: 'Placa já está cadastrada' },
        { status: 400 }
      )
    }

    const veiculo = await prisma.veiculo.create({
      data: {
        placa,
        modelo,
        tipo,
        capacidade,
        transportadorId
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
        }
      }
    })

    return NextResponse.json(veiculo, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar veículo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}