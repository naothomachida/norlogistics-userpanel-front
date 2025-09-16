import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const cliente = await prisma.cliente.findUnique({
      where: { id: params.id },
      include: {
        centrosCusto: {
          where: { ativo: true },
          orderBy: { nome: 'asc' }
        },
        solicitantes: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true
              }
            }
          }
        },
        solicitacoes: {
          take: 10,
          orderBy: { createdAt: 'desc' },
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
            }
          }
        },
        _count: {
          select: {
            solicitacoes: true
          }
        }
      }
    })

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { nomeEmpresa, cnpj, endereco, telefone, email } = await request.json()

    // Verificar se cliente existe
    const existingClient = await prisma.cliente.findUnique({
      where: { id: params.id }
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se CNPJ já está em uso por outro cliente
    if (cnpj && cnpj !== existingClient.cnpj) {
      const cnpjInUse = await prisma.cliente.findFirst({
        where: {
          cnpj,
          id: { not: params.id }
        }
      })

      if (cnpjInUse) {
        return NextResponse.json(
          { error: 'CNPJ já está em uso' },
          { status: 400 }
        )
      }
    }

    const cliente = await prisma.cliente.update({
      where: { id: params.id },
      data: {
        nomeEmpresa,
        cnpj,
        endereco,
        telefone,
        email
      },
      include: {
        centrosCusto: true,
        _count: {
          select: {
            solicitacoes: true
          }
        }
      }
    })

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    // Verificar se cliente existe
    const existingClient = await prisma.cliente.findUnique({
      where: { id: params.id }
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Soft delete - marcar como inativo
    await prisma.cliente.update({
      where: { id: params.id },
      data: { ativo: false }
    })

    return NextResponse.json({ message: 'Cliente removido com sucesso' })
  } catch (error) {
    console.error('Erro ao remover cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}