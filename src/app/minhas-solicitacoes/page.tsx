'use client'

import dynamic from 'next/dynamic'

const MinhasSolicitacoesClient = dynamic(() => import('./ClientPage'), {
  ssr: false,
  loading: () => <div>Carregando solicitações...</div>
})

export default function MinhasSolicitacoesPage() {
  return <MinhasSolicitacoesClient />
}