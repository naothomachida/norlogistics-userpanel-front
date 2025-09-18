import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const veiculo = await prisma.veiculo.findUnique({
      where: { id: params.id },
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
      }
    })

    if (!veiculo) {
      return NextResponse.json(
        { error: 'Veículo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(veiculo)
  } catch (error) {
    console.error('Erro ao buscar veículo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { modelo, tipo, capacidade, ativo } = await request.json()

    // Verificar se veículo existe
    const existingVeiculo = await prisma.veiculo.findUnique({
      where: { id: params.id }
    })

    if (!existingVeiculo) {
      return NextResponse.json(
        { error: 'Veículo não encontrado' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (modelo !== undefined) updateData.modelo = modelo
    if (tipo !== undefined) updateData.tipo = tipo
    if (capacidade !== undefined) updateData.capacidade = parseInt(capacidade)
    if (ativo !== undefined) updateData.ativo = ativo

    const veiculo = await prisma.veiculo.update({
      where: { id: params.id },
      data: updateData,
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
      }
    })

    return NextResponse.json(veiculo)
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se veículo existe
    const existingVeiculo = await prisma.veiculo.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            solicitacoes: true,
            viagens: true,
            manutencoes: true
          }
        }
      }
    })

    if (!existingVeiculo) {
      return NextResponse.json(
        { error: 'Veículo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o veículo tem solicitações, viagens ou manutenções
    if (existingVeiculo._count.solicitacoes > 0 || 
        existingVeiculo._count.viagens > 0 || 
        existingVeiculo._count.manutencoes > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir veículo com solicitações, viagens ou manutenções associadas' },
        { status: 400 }
      )
    }

    await prisma.veiculo.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Veículo excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir veículo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}