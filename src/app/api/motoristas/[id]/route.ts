import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const motorista = await prisma.motorista.findUnique({
      where: { id },
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
      }
    })

    if (!motorista) {
      return NextResponse.json(
        { error: 'Motorista não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(motorista)
  } catch (error) {
    console.error('Erro ao buscar motorista:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { tipo, cnh, valorPorKm } = await request.json()

    // Verificar se motorista existe
    const existingMotorista = await prisma.motorista.findUnique({
      where: { id }
    })

    if (!existingMotorista) {
      return NextResponse.json(
        { error: 'Motorista não encontrado' },
        { status: 404 }
      )
    }

    const motorista = await prisma.motorista.update({
      where: { id },
      data: {
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

    return NextResponse.json(motorista)
  } catch (error) {
    console.error('Erro ao atualizar motorista:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Verificar se motorista existe
    const existingMotorista = await prisma.motorista.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            solicitacoes: true,
            viagens: true
          }
        }
      }
    })

    if (!existingMotorista) {
      return NextResponse.json(
        { error: 'Motorista não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o motorista tem solicitações ou viagens ativas
    if (existingMotorista._count.solicitacoes > 0 || existingMotorista._count.viagens > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir motorista com solicitações ou viagens associadas' },
        { status: 400 }
      )
    }

    await prisma.motorista.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Motorista excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir motorista:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}