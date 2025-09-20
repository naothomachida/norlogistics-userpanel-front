import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    console.log('Token encontrado:', !!token)

    if (!token) {
      console.log('Nenhum token encontrado nos cookies')
      return NextResponse.json(
        { error: 'Token não encontrado' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    console.log('Payload válido:', !!payload)

    if (!payload) {
      console.log('Token inválido ou expirado')
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Buscar dados atualizados do usuário
    const user = await prisma.usuario.findUnique({
      where: { id: payload.userId as string },
      include: {
        solicitante: {
          include: {
            cliente: true,
            centroCusto: true,
            gestor: {
              include: {
                usuario: true
              }
            }
          }
        },
        gestor: true,
        transportador: true,
        motorista: true
      }
    })

    if (!user || !user.ativo) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const userData = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      telefone: user.telefone,
      solicitante: user.solicitante,
      gestor: user.gestor,
      transportador: user.transportador,
      motorista: user.motorista
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error('Erro ao verificar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}