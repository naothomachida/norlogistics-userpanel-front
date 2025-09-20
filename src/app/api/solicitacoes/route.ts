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
    console.log('Received data:', JSON.stringify(data, null, 2))

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
      valorTotal,
      directApproval // Nova flag para aprovação direta
    } = data

    if (!solicitanteId || !clienteId || !centroCustoId || !pontoColeta || !pontoEntrega || !dataColeta || !dataEntrega) {
      console.log('Missing required fields:', {
        solicitanteId: !!solicitanteId,
        clienteId: !!clienteId,
        centroCustoId: !!centroCustoId,
        pontoColeta: !!pontoColeta,
        pontoEntrega: !!pontoEntrega,
        dataColeta: !!dataColeta,
        dataEntrega: !!dataEntrega
      })
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Validar se as foreign keys existem
    const [solicitanteExists, clienteExists, centroCustoExists, gestorExists] = await Promise.all([
      prisma.solicitante.findUnique({ where: { id: solicitanteId } }),
      prisma.cliente.findUnique({ where: { id: clienteId } }),
      prisma.centroCusto.findUnique({ where: { id: centroCustoId } }),
      gestorId ? prisma.gestor.findUnique({ where: { id: gestorId } }) : Promise.resolve(true)
    ])

    if (!solicitanteExists) {
      console.log('Solicitante not found:', solicitanteId)
      return NextResponse.json(
        { error: 'Solicitante não encontrado' },
        { status: 400 }
      )
    }

    if (!clienteExists) {
      console.log('Cliente not found:', clienteId)
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 400 }
      )
    }

    if (!centroCustoExists) {
      console.log('Centro de custo not found:', centroCustoId)
      return NextResponse.json(
        { error: 'Centro de custo não encontrado' },
        { status: 400 }
      )
    }

    if (gestorId && !gestorExists) {
      console.log('Gestor not found:', gestorId)
      return NextResponse.json(
        { error: 'Gestor não encontrado' },
        { status: 400 }
      )
    }

    // Gerar número da ordem
    const count = await prisma.solicitacao.count()
    const numeroOrdem = `ORD${String(count + 1).padStart(6, '0')}`

    // Determinar status inicial baseado no tipo de aprovação
    const initialStatus = directApproval ? 'APROVADA' : 'PENDENTE'

    // Executar tudo em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar a solicitação
      const solicitacao = await tx.solicitacao.create({
        data: {
          numeroOrdem,
          solicitanteId,
          clienteId,
          centroCustoId,
          gestorId,
          pontoColeta,
          enderecoColeta,
          dataColeta: new Date(dataColeta),
          horaColeta: horaColeta || '',
          pontoEntrega,
          enderecoEntrega,
          dataEntrega: new Date(dataEntrega),
          horaEntrega: horaEntrega || '',
          pontoRetorno,
          enderecoRetorno,
          dataRetorno: dataRetorno ? new Date(dataRetorno) : null,
          horaRetorno: horaRetorno || null,
          descricaoMaterial,
          quantidadeVolumes: parseInt(quantidadeVolumes),
          dimensoes,
          tipoEmbalagem,
          pesoTotal: parseFloat(pesoTotal),
          numeroDanfe,
          valorDanfe: valorDanfe ? parseFloat(valorDanfe) : null,
          tipoVeiculo,
          observacoes,
          kmTotal: parseFloat(kmTotal) || 0,
          valorPedagio: parseFloat(valorPedagio || 0),
          valorServico: parseFloat(valorServico) || 0,
          valorTotal: parseFloat(valorTotal) || 0,
          status: initialStatus
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
          centroCusto: true,
          gestor: {
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
      })

      // Se for aprovação direta, criar registro de aprovação
      if (directApproval && gestorId) {
        await tx.aprovacao.create({
          data: {
            solicitacaoId: solicitacao.id,
            gestorId: gestorId,
            aprovada: true,
            observacao: 'Aprovação direta pelo solicitante'
          }
        })
      }

      return solicitacao
    })

    // TODO: Implementar sistema de notificação
    // Se for aprovação direta: notificar gestor sobre a aprovação
    // Se for para aprovação: notificar gestor para analisar
    try {
      if (result.gestor?.usuario?.email) {
        const gestorEmail = result.gestor.usuario.email
        const gestorNome = result.gestor.usuario.nome
        const solicitanteNome = result.solicitante.usuario.nome

        if (directApproval) {
          console.log(`📧 Notificação para gestor ${gestorNome} (${gestorEmail}): Solicitação ${numeroOrdem} foi aprovada diretamente por ${solicitanteNome}`)
          // Aqui você pode integrar com serviço de email (Nodemailer, SendGrid, etc.)
        } else {
          console.log(`📧 Notificação para gestor ${gestorNome} (${gestorEmail}): Nova solicitação ${numeroOrdem} aguardando aprovação de ${solicitanteNome}`)
          // Aqui você pode integrar com serviço de email (Nodemailer, SendGrid, etc.)
        }
      }
    } catch (notificationError) {
      console.warn('Erro ao enviar notificação:', notificationError)
      // Não falhar a criação da solicitação por causa da notificação
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}