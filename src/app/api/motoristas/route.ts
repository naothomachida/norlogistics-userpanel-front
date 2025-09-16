import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const transportadorId = searchParams.get('transportadorId')
    const tipo = searchParams.get('tipo')
    
    const whereClause: any = { 
      usuario: { ativo: true }
    }
    
    if (transportadorId) whereClause.transportadorId = transportadorId
    if (tipo) whereClause.tipo = tipo
    
    const motoristas = await prisma.motorista.findMany({
      where: whereClause,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true
          }
        },
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
            viagens: true
          }
        }
      },
      orderBy: { 
        usuario: { nome: 'asc' }
      }
    })

    return NextResponse.json(motoristas)
  } catch (error) {
    console.error('Erro ao buscar motoristas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { usuarioId, transportadorId, tipo, cnh, valorPorKm } = await request.json()

    if (!usuarioId || !tipo || !cnh) {
      return NextResponse.json(
        { error: 'Usuário, tipo e CNH são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se usuário já tem perfil de motorista
    const existingMotorista = await prisma.motorista.findUnique({
      where: { usuarioId }
    })

    if (existingMotorista) {
      return NextResponse.json(
        { error: 'Usuário já possui perfil de motorista' },
        { status: 400 }
      )
    }

    const motorista = await prisma.motorista.create({
      data: {
        usuarioId,
        transportadorId,
        tipo,
        cnh,
        valorPorKm: valorPorKm ? parseFloat(valorPorKm) : null
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true
          }
        },
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

    return NextResponse.json(motorista, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar motorista:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}