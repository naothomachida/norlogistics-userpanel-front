import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/',
    '/login',
    '/api/auth/login',
    '/api/auth/logout'
  ]

  // Verificar se é uma rota pública
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Verificar se é uma rota da API protegida
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Token de acesso requerido' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Adicionar informações do usuário ao header para as APIs
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId as string)
    requestHeaders.set('x-user-email', payload.email as string)
    requestHeaders.set('x-user-role', payload.role as string)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Verificar se é uma rota de dashboard/admin que precisa de autenticação
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/operacoes') ||
    pathname.startsWith('/motorista') ||
    pathname.startsWith('/solicitar-coleta')
  ) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const payload = await verifyToken(token)
    if (!payload) {
      // Token inválido - redirecionar para login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      return response
    }

    // Verificar permissões baseadas no role
    const userRole = payload.role as string

    if (pathname.startsWith('/dashboard') && userRole !== 'GESTOR') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (pathname.startsWith('/admin') && userRole !== 'GESTOR') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (pathname.startsWith('/operacoes') && userRole !== 'TRANSPORTADOR') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (pathname.startsWith('/motorista') && userRole !== 'MOTORISTA') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (pathname.startsWith('/solicitar-coleta') && userRole !== 'SOLICITANTE') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}