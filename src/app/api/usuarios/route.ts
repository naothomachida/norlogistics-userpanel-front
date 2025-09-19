import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')
    
    const whereClause = role ? { role: role as 'GESTOR' | 'SOLICITANTE' | 'TRANSPORTADOR' | 'MOTORISTA' } : {}
    
    const usuarios = await prisma.usuario.findMany({
      where: {
        ...whereClause,
        ativo: true
      },
      include: {
        solicitante: {
          include: {
            cliente: true,
            centroCusto: true
          }
        },
        gestor: true,
        transportador: true,
        motorista: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Remover senhas dos resultados
    const usuariosSemSenha = usuarios.map(({ senha, ...user }) => user)

    return NextResponse.json(usuariosSemSenha)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { nome, email, telefone, senha, role, ...profileData } = data

    if (!nome || !email || !senha || !role) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: nome, email, senha e role' },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await hashPassword(senha)

    // Criar usuário em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar usuário
      const usuario = await tx.usuario.create({
        data: {
          nome,
          email,
          telefone,
          senha: hashedPassword,
          role
        }
      })

      // Criar perfil específico baseado no role
      let profile = null
      switch (role) {
        case 'SOLICITANTE':
          if (profileData.clienteId && profileData.centroCustoId && profileData.gestorId) {
            profile = await tx.solicitante.create({
              data: {
                usuarioId: usuario.id,
                clienteId: profileData.clienteId,
                centroCustoId: profileData.centroCustoId,
                gestorId: profileData.gestorId,
                limiteValor: profileData.limiteValor || 0
              }
            })
          }
          break
        case 'GESTOR':
          profile = await tx.gestor.create({
            data: {
              usuarioId: usuario.id
            }
          })
          break
        case 'TRANSPORTADOR':
          if (profileData.nomeEmpresa && profileData.cnpj) {
            profile = await tx.transportador.create({
              data: {
                usuarioId: usuario.id,
                nomeEmpresa: profileData.nomeEmpresa,
                cnpj: profileData.cnpj
              }
            })
          }
          break
        case 'MOTORISTA':
          if (profileData.cnh && profileData.tipo) {
            profile = await tx.motorista.create({
              data: {
                usuarioId: usuario.id,
                transportadorId: profileData.transportadorId,
                tipo: profileData.tipo,
                cnh: profileData.cnh,
                valorPorKm: profileData.valorPorKm
              }
            })
          }
          break
      }

      return { usuario, profile }
    })

    // Buscar usuário completo para retornar
    const usuarioCompleto = await prisma.usuario.findUnique({
      where: { id: result.usuario.id },
      include: {
        solicitante: {
          include: {
            cliente: true,
            centroCusto: true
          }
        },
        gestor: true,
        transportador: true,
        motorista: true
      }
    })

    // Remover senha do resultado
    const { senha: _, ...usuarioSemSenha } = usuarioCompleto!

    return NextResponse.json(usuarioSemSenha, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}