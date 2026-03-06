import { useState, useRef, useEffect, type ReactNode } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/utils/cn'

interface TooltipProps {
  content: string | ReactNode
  children?: ReactNode
  className?: string
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState<'top' | 'bottom'>('top')
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const spaceAbove = triggerRect.top
      const spaceBelow = window.innerHeight - triggerRect.bottom

      // If not enough space above, show below
      if (spaceAbove < tooltipRect.height + 10 && spaceBelow > spaceAbove) {
        setPosition('bottom')
      } else {
        setPosition('top')
      }
    }
  }, [isVisible])

  return (
    <div className="relative inline-flex">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className={cn('inline-flex cursor-help', className)}
      >
        {children || <Info className="size-4 text-muted-foreground hover:text-foreground transition-colors" />}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'absolute z-50 px-3 py-2 text-sm font-medium text-white bg-charcoal rounded-lg shadow-lg',
            'pointer-events-none whitespace-nowrap',
            'animate-in fade-in-0 zoom-in-95',
            position === 'top'
              ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
              : 'top-full left-1/2 -translate-x-1/2 mt-2'
          )}
        >
          {content}
          {/* Arrow */}
          <div
            className={cn(
              'absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-charcoal rotate-45',
              position === 'top' ? '-bottom-1' : '-top-1'
            )}
          />
        </div>
      )}
    </div>
  )
}

// Field label with tooltip companion component
interface FieldLabelProps {
  label: string
  tooltip: string
  htmlFor?: string
}

export function FieldLabel({ label, tooltip, htmlFor }: FieldLabelProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <Tooltip content={tooltip} />
    </div>
  )
}
