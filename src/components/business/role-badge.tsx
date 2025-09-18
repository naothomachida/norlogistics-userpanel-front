import { ROLE_LABELS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'

interface RoleBadgeProps {
  role: string
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function RoleBadge({ role, size = 'default', className }: RoleBadgeProps) {
  const variantMap: Record<string, string> = {
    'GESTOR': 'gestor',
    'SOLICITANTE': 'solicitante',
    'TRANSPORTADOR': 'transportador',
    'MOTORISTA': 'motorista'
  }

  return (
    <Badge
      variant={(variantMap[role] || 'default') as "gestor" | "solicitante" | "transportador" | "motorista" | "default"}
      size={size}
      className={className}
    >
      {ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role}
    </Badge>
  )
}