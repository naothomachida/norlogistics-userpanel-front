import Link from 'next/link'
import { cn } from '@/lib/utils'

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
    title: 'text-2xl',
    subtitle: 'text-sm'
  },
  lg: {
    icon: 'w-12 h-12',
    title: 'text-3xl',
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
    <Link href="/dashboard" className={cn("flex items-center space-x-3", className)}>
      <div className={cn(
        "bg-purple-600 rounded-lg flex items-center justify-center",
        sizes.icon
      )}>
        <span className="text-white font-bold text-xl">N</span>
      </div>
      {showText && (
        <div>
          <h1 className={cn(
            "font-bold text-purple-400",
            sizes.title
          )}>
            Nor Logistics
          </h1>
          <p className={cn(
            "text-purple-300",
            sizes.subtitle
          )}>
            Sistema de Gestão
          </p>
        </div>
      )}
    </Link>
  )
}