import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário no banco
    const user = await prisma.usuario.findUnique({
      where: { email },
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
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verificar senha
    const isValidPassword = await verifyPassword(password, user.senha)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Gerar token JWT
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Preparar dados do usuário para o frontend
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

    const response = NextResponse.json({
      user: userData,
      message: 'Login realizado com sucesso'
    })

    // Definir cookie com o token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}