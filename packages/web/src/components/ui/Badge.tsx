import { cn } from '@/utils/cn'

import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  className?: string
  children: ReactNode
}

const variantStyles = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-accent/15 text-accent',
  warning: 'bg-warning/15 text-warning',
  destructive: 'bg-destructive/15 text-destructive',
} as const

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
