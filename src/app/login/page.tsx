'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice'
import { X, Info } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showTestUsersModal, setShowTestUsersModal] = useState(false)
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
    setShowTestUsersModal(false)
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
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        dispatch(loginSuccess(data.user))
        
        // Redirecionar para o dashboard principal
        router.push('/')
      } else {
        dispatch(loginFailure(data.error || 'Erro ao fazer login'))
      }
    } catch (error) {
      dispatch(loginFailure('Erro de conexão'))
    }
  }

  return (
    <div className="min-h-screen flex relative">
      {/* Test Users Button - Top Left */}
      <button
        type="button"
        onClick={() => setShowTestUsersModal(true)}
        className="fixed top-4 left-4 z-10 w-8 h-8 rounded-full bg-slate-700/80 hover:bg-slate-600/80 text-slate-300 hover:text-white transition-all duration-200 flex items-center justify-center border border-slate-600/50"
        title="Usuários de teste"
      >
        <Info className="w-4 h-4" />
      </button>

      {/* Left side - Login Form (40%) */}
      <div className="w-2/5 flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img 
              src="/logo-nor-white.png" 
              alt="NOR Logistics" 
              className="h-12 w-auto mx-auto mt-6"
            />
            <h1 className="mt-4 text-center text-2xl font-bold text-white tracking-wider">
              NOR-LOGISTICS
            </h1>
            <p className="mt-4 text-center text-sm text-slate-300">
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-600 bg-slate-800/50 placeholder-slate-400 text-white rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-600 bg-slate-800/50 placeholder-slate-400 text-white rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-900/50 border border-red-700 p-4">
              <div className="text-sm text-red-300">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          {/* Discrete Test Users Icon - Removed from here, now in top-left */}
        </form>
      </div>
      </div>
      
      {/* Test Users Modal */}
      {showTestUsersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Usuários de Teste</h3>
              <button
                onClick={() => setShowTestUsersModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-slate-300 mb-4">
              Clique em um dos usuários para preencher automaticamente:
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillTestUser('SOLICITANTE')}
                className="px-4 py-3 text-sm bg-blue-900/50 hover:bg-blue-800/70 text-blue-300 rounded-md border border-blue-700 transition-colors"
              >
                📋 Solicitante
              </button>
              <button
                type="button"
                onClick={() => fillTestUser('GESTOR')}
                className="px-4 py-3 text-sm bg-green-900/50 hover:bg-green-800/70 text-green-300 rounded-md border border-green-700 transition-colors"
              >
                ✅ Gestor
              </button>
              <button
                type="button"
                onClick={() => fillTestUser('TRANSPORTADOR')}
                className="px-4 py-3 text-sm bg-orange-900/50 hover:bg-orange-800/70 text-orange-300 rounded-md border border-orange-700 transition-colors"
              >
                🚛 Transportador
              </button>
              <button
                type="button"
                onClick={() => fillTestUser('MOTORISTA')}
                className="px-4 py-3 text-sm bg-purple-900/50 hover:bg-purple-800/70 text-purple-300 rounded-md border border-purple-700 transition-colors"
              >
                🗺️ Motorista
              </button>
            </div>
            
            <div className="mt-4 text-center text-xs text-slate-400">
              Senha para todos: <span className="font-medium text-slate-300">123456</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Right side - Background Image with Logo (60%) */}
      <div className="w-3/5 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/bg-login/bg-7.webp)'
          }}
        />
        
        {/* Dark overlay to match left side colors */}
        <div className="absolute inset-0 bg-slate-900/40" />
        
        {/* Logo - Full size */}
        <div className="relative h-full flex items-center justify-center p-8">
          <img 
            src="/logo-nor-vazado.png" 
            alt="NOR Logistics" 
            className="w-full h-full object-contain opacity-20 drop-shadow-2xl filter brightness-125"
          />
        </div>
        
        {/* Subtle glow effect */}
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"></div>
      </div>
    </div>
  )
}