import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Truck } from 'lucide-react'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: {
    icon: 'w-8 h-8',
    title: 'text-lg',
    subtitle: 'text-xs'
  },
  md: {
    icon: 'w-10 h-10',
    title: 'text-xl',
    subtitle: 'text-sm'
  },
  lg: {
    icon: 'w-12 h-12',
    title: 'text-2xl',
    subtitle: 'text-base'
  }
}

export function Logo({
  className,
  showText = true,
  size = 'md'
}: LogoProps) {
  const sizes = sizeClasses[size]

  return (
    <Link href="/dashboard" className={cn("flex items-center space-x-3 group transition-all duration-200 hover:scale-105", className)}>
      <div className={cn(
        "bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-200",
        sizes.icon
      )}>
        <Truck className="text-white w-5 h-5" />
      </div>
      {showText && (
        <div className="transition-all duration-200">
          <h1 className={cn(
            "font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-blue-300 transition-all duration-200",
            sizes.title
          )}>
            NOR Logistics
          </h1>
          <p className={cn(
            "text-slate-400 group-hover:text-slate-300 transition-colors duration-200",
            sizes.subtitle
          )}>
            Sistema de Gestão
          </p>
        </div>
      )}
    </Link>
  )
}