import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
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

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Remover senha do resultado
    const { senha, ...usuarioSemSenha } = usuario

    return NextResponse.json(usuarioSemSenha)
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
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
    const { nome, email, telefone, senha, role, ...profileData } = data

    // Verificar se usuário existe
    const existingUser = await prisma.usuario.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se email já está em uso por outro usuário
    if (email && email !== existingUser.email) {
      const emailInUse = await prisma.usuario.findFirst({
        where: {
          email,
          id: { not: id }
        }
      })

      if (emailInUse) {
        return NextResponse.json(
          { error: 'Email já está em uso' },
          { status: 400 }
        )
      }
    }

    // Preparar dados para atualização
    const updateData: any = {}
    if (nome) updateData.nome = nome
    if (email) updateData.email = email
    if (telefone) updateData.telefone = telefone
    if (senha) updateData.senha = await hashPassword(senha)
    if (role) updateData.role = role

    // Atualizar usuário
    const usuario = await prisma.usuario.update({
      where: { id },
      data: updateData
    })

    // Buscar usuário completo para retornar
    const usuarioCompleto = await prisma.usuario.findUnique({
      where: { id },
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

    return NextResponse.json(usuarioSemSenha)
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
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
  const { id } = await params
  try {
    // Verificar se usuário existe
    const existingUser = await prisma.usuario.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Soft delete - marcar como inativo ao invés de deletar
    await prisma.usuario.update({
      where: { id },
      data: { ativo: false }
    })

    return NextResponse.json({ message: 'Usuário removido com sucesso' })
  } catch (error) {
    console.error('Erro ao remover usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}