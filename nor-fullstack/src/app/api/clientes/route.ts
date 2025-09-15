import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      where: { ativo: true },
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
        _count: {
          select: {
            solicitacoes: true
          }
        }
      },
      orderBy: { nomeEmpresa: 'asc' }
    })

    return NextResponse.json(clientes)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nomeEmpresa, cnpj, endereco, telefone, email } = await request.json()

    if (!nomeEmpresa || !cnpj || !endereco || !telefone || !email) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se CNPJ já existe
    const existingClient = await prisma.cliente.findUnique({
      where: { cnpj }
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'CNPJ já está cadastrado' },
        { status: 400 }
      )
    }

    const cliente = await prisma.cliente.create({
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

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}