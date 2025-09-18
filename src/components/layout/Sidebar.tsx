'use client'

import { useState } from 'react'
import { Logo } from '@/components/business/logo'
import { Navigation } from '@/components/business/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="h-10 w-10 p-0 bg-white shadow-lg border border-gray-200 hover:bg-gray-50"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out",
        "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-xl",
        "w-22",
        "lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        className
      )}>
        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center p-4 border-b border-slate-700/50">
          <img 
            src="/logo-nor-white.png" 
            alt="NOR Logistics" 
            className="h-8 w-auto my-4"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <Navigation 
            orientation="vertical" 
            showIcons={true}
          />
        </nav>

        {/* Subtle glow effect */}
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"></div>
      </aside>
    </>
  )
}