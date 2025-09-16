import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const solicitanteId = searchParams.get('solicitanteId')
    const gestorId = searchParams.get('gestorId')
    const transportadorId = searchParams.get('transportadorId')
    const motoristaId = searchParams.get('motoristaId')
    
    const whereClause: any = {}
    
    if (status) whereClause.status = status
    if (solicitanteId) whereClause.solicitanteId = solicitanteId
    if (gestorId) whereClause.gestorId = gestorId
    if (transportadorId) whereClause.transportadorId = transportadorId
    if (motoristaId) whereClause.motoristaId = motoristaId
    
    const solicitacoes = await prisma.solicitacao.findMany({
      where: whereClause,
      include: {
        solicitante: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            },
            cliente: {
              select: {
                id: true,
                nomeEmpresa: true
              }
            }
          }
        },
        cliente: {
          select: {
            id: true,
            nomeEmpresa: true
          }
        },
        centroCusto: {
          select: {
            id: true,
            nome: true,
            codigo: true
          }
        },
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
                nome: true
              }
            }
          }
        },
        veiculo: {
          select: {
            id: true,
            placa: true,
            modelo: true,
            tipo: true
          }
        },
        aprovacao: true,
        viagem: true,
        custosExtras: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(solicitacoes)
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      solicitanteId,
      clienteId,
      centroCustoId,
      gestorId,
      pontoColeta,
      enderecoColeta,
      dataColeta,
      horaColeta,
      pontoEntrega,
      enderecoEntrega,
      dataEntrega,
      horaEntrega,
      pontoRetorno,
      enderecoRetorno,
      dataRetorno,
      horaRetorno,
      descricaoMaterial,
      quantidadeVolumes,
      dimensoes,
      tipoEmbalagem,
      pesoTotal,
      numeroDanfe,
      valorDanfe,
      tipoVeiculo,
      observacoes,
      kmTotal,
      valorPedagio,
      valorServico,
      valorTotal
    } = data

    if (!solicitanteId || !clienteId || !centroCustoId || !pontoColeta || !pontoEntrega) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Gerar número da ordem
    const count = await prisma.solicitacao.count()
    const numeroOrdem = `ORD${String(count + 1).padStart(6, '0')}`

    const solicitacao = await prisma.solicitacao.create({
      data: {
        numeroOrdem,
        solicitanteId,
        clienteId,
        centroCustoId,
        gestorId,
        pontoColeta,
        enderecoColeta,
        dataColeta: new Date(dataColeta),
        horaColeta,
        pontoEntrega,
        enderecoEntrega,
        dataEntrega: new Date(dataEntrega),
        horaEntrega,
        pontoRetorno,
        enderecoRetorno,
        dataRetorno: dataRetorno ? new Date(dataRetorno) : null,
        horaRetorno,
        descricaoMaterial,
        quantidadeVolumes: parseInt(quantidadeVolumes),
        dimensoes,
        tipoEmbalagem,
        pesoTotal: parseFloat(pesoTotal),
        numeroDanfe,
        valorDanfe: valorDanfe ? parseFloat(valorDanfe) : null,
        tipoVeiculo,
        observacoes,
        kmTotal: parseFloat(kmTotal),
        valorPedagio: parseFloat(valorPedagio || 0),
        valorServico: parseFloat(valorServico),
        valorTotal: parseFloat(valorTotal),
        status: 'PENDENTE'
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
        cliente: true,
        centroCusto: true
      }
    })

    return NextResponse.json(solicitacao, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}