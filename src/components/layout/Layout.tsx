'use client'

import { ReactNode } from 'react'
import { Header } from './Header'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export function Layout({
  children,
  title,
  description,
  className,
  headerClassName,
  contentClassName
}: LayoutProps) {
  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      <Header className={headerClassName} />

      <main className="flex-1">
        {/* Page Header */}
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

        {/* Page Content */}
        <div className={cn("", contentClassName)}>
          {children}
        </div>
      </main>
    </div>
  )
}