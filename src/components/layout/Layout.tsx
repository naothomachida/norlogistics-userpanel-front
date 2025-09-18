'use client'

import { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
  className?: string
  headerClassName?: string
  sidebarClassName?: string
  contentClassName?: string
}

export function Layout({
  children,
  title,
  description,
  className,
  headerClassName,
  sidebarClassName,
  contentClassName
}: LayoutProps) {
  return (
    <div className={cn("min-h-screen bg-gray-50 flex", className)}>
      <Sidebar className={sidebarClassName} />

      <div className="flex-1 lg:ml-22 flex flex-col">
        <Header className={headerClassName} />
        
        {/* Main content area */}
        <main className="flex-1">
          {/* Page Header */}
          {(title || description) && (
            <div className="bg-white border-b">
              <div className="py-6 px-4 sm:px-6 lg:px-8">
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
    </div>
  )
}