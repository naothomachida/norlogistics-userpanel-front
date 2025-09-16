'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.auth)

  const fillTestUser = (role: string) => {
    const testUsers = {
      'SOLICITANTE': 'solicitante@test.com',
      'GESTOR': 'gestor@test.com', 
      'TRANSPORTADOR': 'transportador@test.com',
      'MOTORISTA': 'motorista@test.com'
    }
    setEmail(testUsers[role as keyof typeof testUsers])
    setPassword('123456')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    dispatch(loginStart())

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        dispatch(loginSuccess(data.user))
        
        // Redirecionar baseado no role do usuário
        switch (data.user.role) {
          case 'SOLICITANTE':
            router.push('/solicitar-coleta')
            break
          case 'GESTOR':
            router.push('/dashboard')
            break
          case 'TRANSPORTADOR':
            router.push('/operacoes')
            break
          case 'MOTORISTA':
            router.push('/motorista')
            break
          default:
            router.push('/')
        }
      } else {
        dispatch(loginFailure(data.error || 'Erro ao fazer login'))
      }
    } catch (error) {
      dispatch(loginFailure('Erro de conexão'))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sistema de Logística NOR
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entre com suas credenciais
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-600 mb-3">
              <strong>Usuários de teste - Clique para preencher:</strong>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillTestUser('SOLICITANTE')}
                className="px-3 py-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md border border-blue-300 transition-colors"
              >
                📋 Solicitante
              </button>
              <button
                type="button"
                onClick={() => fillTestUser('GESTOR')}
                className="px-3 py-2 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded-md border border-green-300 transition-colors"
              >
                ✅ Gestor
              </button>
              <button
                type="button"
                onClick={() => fillTestUser('TRANSPORTADOR')}
                className="px-3 py-2 text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-md border border-orange-300 transition-colors"
              >
                🚛 Transportador
              </button>
              <button
                type="button"
                onClick={() => fillTestUser('MOTORISTA')}
                className="px-3 py-2 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md border border-purple-300 transition-colors"
              >
                🗺️ Motorista
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Senha para todos: <span className="font-medium">123456</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}