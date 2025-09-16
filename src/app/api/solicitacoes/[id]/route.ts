import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id },
      include: {
        solicitante: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true
              }
            },
            cliente: true,
            centroCusto: true
          }
        },
        cliente: true,
        centroCusto: true,
        gestor: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        },
        transportador: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true
              }
            }
          }
        },
        motorista: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                telefone: true
              }
            }
          }
        },
        veiculo: true,
        aprovacao: true,
        viagem: true,
        custosExtras: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!solicitacao) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(solicitacao)
  } catch (error) {
    console.error('Erro ao buscar solicitação:', error)
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
  const { id } = await params
  try {
    const data = await request.json()

    // Verificar se solicitação existe
    const existingSolicitacao = await prisma.solicitacao.findUnique({
      where: { id }
    })

    if (!existingSolicitacao) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      )
    }

    // Preparar dados para atualização
    const updateData: any = { ...data }
    
    // Converter datas se fornecidas
    if (data.dataColeta) updateData.dataColeta = new Date(data.dataColeta)
    if (data.dataEntrega) updateData.dataEntrega = new Date(data.dataEntrega)
    if (data.dataRetorno) updateData.dataRetorno = new Date(data.dataRetorno)
    
    // Converter números se fornecidos
    if (data.quantidadeVolumes) updateData.quantidadeVolumes = parseInt(data.quantidadeVolumes)
    if (data.pesoTotal) updateData.pesoTotal = parseFloat(data.pesoTotal)
    if (data.valorDanfe) updateData.valorDanfe = parseFloat(data.valorDanfe)
    if (data.kmTotal) updateData.kmTotal = parseFloat(data.kmTotal)
    if (data.valorPedagio) updateData.valorPedagio = parseFloat(data.valorPedagio)
    if (data.valorServico) updateData.valorServico = parseFloat(data.valorServico)
    if (data.valorTotal) updateData.valorTotal = parseFloat(data.valorTotal)
    if (data.valorMotorista) updateData.valorMotorista = parseFloat(data.valorMotorista)

    const solicitacao = await prisma.solicitacao.update({
      where: { id },
      data: updateData,
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
        cliente: true,
        centroCusto: true,
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
                nome: true
              }
            }
          }
        },
        veiculo: true
      }
    })

    return NextResponse.json(solicitacao)
  } catch (error) {
    console.error('Erro ao atualizar solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}