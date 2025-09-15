'use client'

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Sistema de Logística NOR
              </h1>
            </div>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 text-sm">
                  Olá, {user?.nome}
                </span>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Entrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {isAuthenticated ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Bem-vindo, {user?.nome}!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {user?.role === 'SOLICITANTE' && (
                <Link
                  href="/solicitar-coleta"
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm">📋</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Nova Solicitação
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            Solicitar Coleta
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {user?.role === 'GESTOR' && (
                <>
                  <Link
                    href="/dashboard/aprovacoes"
                    className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Aprovações
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              Pendentes
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/admin/usuarios"
                    className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                            <span className="text-white text-sm">👥</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Usuários
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              Gerenciar
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </Link>
                </>
              )}

              {user?.role === 'TRANSPORTADOR' && (
                <>
                  <Link
                    href="/operacoes"
                    className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                            <span className="text-white text-sm">🚛</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Operações
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              Gerenciar Fretes
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/operacoes/financeiro"
                    className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                            <span className="text-white text-sm">💰</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Financeiro
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              Fluxo de Caixa
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </Link>
                </>
              )}

              {user?.role === 'MOTORISTA' && (
                <Link
                  href="/motorista"
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm">🗺️</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Viagens
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            Minhas Rotas
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sistema de Logística NOR
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Gerencie suas operações logísticas de forma eficiente
            </p>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Módulos do Sistema:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-semibold text-blue-600">Portal do Cliente</h4>
                  <p className="text-sm text-gray-600">Solicitação de coletas e acompanhamento</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-semibold text-green-600">Portal do Gestor</h4>
                  <p className="text-sm text-gray-600">Aprovações e gestão de usuários</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-semibold text-orange-600">Portal Transportador</h4>
                  <p className="text-sm text-gray-600">Operações e controle financeiro</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-semibold text-red-600">App do Motorista</h4>
                  <p className="text-sm text-gray-600">Gestão de rotas e custos</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Fazer Login
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
