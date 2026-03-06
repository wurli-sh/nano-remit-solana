import { motion } from 'framer-motion'

import { cn } from '@/utils/cn'

interface ToggleOption<T extends string> {
  value: T
  label: string
}

interface ToggleProps<T extends string> {
  value: T
  options: ToggleOption<T>[]
  onChange: (value: T) => void
  className?: string
}

export function Toggle<T extends string>({
  value,
  options,
  onChange,
  className,
}: ToggleProps<T>) {
  return (
    <div className={cn('flex rounded-full border border-border bg-white p-1', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'relative cursor-pointer rounded-full px-5 py-1.5 text-sm font-medium transition-colors',
            value === option.value
              ? 'text-white'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {value === option.value && (
            <motion.div
              layoutId="activeToggle"
              className="absolute inset-0 rounded-full bg-charcoal shadow-sm"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
