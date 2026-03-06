import { cn } from '@/utils/cn'

import type { ReactNode } from 'react'

interface CardProps {
  className?: string
  children: ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('rounded-xl border bg-card p-6 text-card-foreground', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  className?: string
  children: ReactNode
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-foreground', className)}>
      {children}
    </h3>
  )
}

interface CardDescriptionProps {
  className?: string
  children: ReactNode
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  )
}
