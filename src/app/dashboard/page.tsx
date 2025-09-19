'use client'

import dynamic from 'next/dynamic'

const DashboardClient = dynamic(() => import('./DashboardClient'), {
  ssr: false,
  loading: () => <div>Carregando dashboard...</div>
})

export default function DashboardPage() {
  return <DashboardClient />
}