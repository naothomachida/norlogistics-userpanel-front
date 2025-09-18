'use client'

import { ReactNode } from 'react'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export default function Layout({ children, title, description }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        {(title || description) && (
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              {title && (
                <h1 className="text-3xl font-bold text-gray-900">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-2 text-sm text-gray-600">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}