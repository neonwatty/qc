'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { X, GripHorizontal } from 'lucide-react'

import { cn } from '@/lib/utils'
import { TouchButton } from '@/components/ui/TouchButton'

const sheetVariants = cva('fixed bg-background border-border shadow-lg touch-none', {
  variants: {
    side: {
      top: 'inset-x-0 top-0 border-b rounded-b-2xl',
      bottom: 'inset-x-0 bottom-0 border-t rounded-t-2xl',
      left: 'inset-y-0 left-0 border-r rounded-r-2xl w-3/4 max-w-sm',
      right: 'inset-y-0 right-0 border-l rounded-l-2xl w-3/4 max-w-sm',
    },
    size: {
      sm: '',
      default: '',
      lg: '',
      xl: '',
      full: '',
    },
  },
  compoundVariants: [
    { side: ['top', 'bottom'], size: 'sm', class: 'h-1/3' },
    { side: ['top', 'bottom'], size: 'default', class: 'h-1/2' },
    { side: ['top', 'bottom'], size: 'lg', class: 'h-2/3' },
    { side: ['top', 'bottom'], size: 'xl', class: 'h-5/6' },
    { side: ['top', 'bottom'], size: 'full', class: 'h-full rounded-none' },
    { side: ['left', 'right'], size: 'sm', class: 'w-3/4 max-w-xs' },
    { side: ['left', 'right'], size: 'default', class: 'w-3/4 max-w-sm' },
    { side: ['left', 'right'], size: 'lg', class: 'w-4/5 max-w-md' },
    { side: ['left', 'right'], size: 'xl', class: 'w-5/6 max-w-lg' },
    { side: ['left', 'right'], size: 'full', class: 'w-full rounded-none' },
  ],
  defaultVariants: {
    side: 'bottom',
    size: 'default',
  },
})

interface MobileSheetProps extends VariantProps<typeof sheetVariants> {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  showHandle?: boolean
  showCloseButton?: boolean
  dismissible?: boolean
  preventClose?: boolean
  onDragEnd?: (info: PanInfo) => void
}

const MobileSheet: React.FC<MobileSheetProps> = ({
  open,
  onClose,
  children,
  side = 'bottom',
  size = 'default',
  className,
  showHandle = true,
  showCloseButton = true,
  dismissible = true,
  preventClose = false,
  onDragEnd: onDragEndProp,
}) => {
  const [isDragging, setIsDragging] = React.useState(false)

  const variants = React.useMemo(() => {
    const base = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    switch (side) {
      case 'bottom':
        return {
          ...base,
          initial: { ...base.initial, y: '100%' },
          animate: { ...base.animate, y: 0 },
          exit: { ...base.exit, y: '100%' },
        }
      case 'top':
        return {
          ...base,
          initial: { ...base.initial, y: '-100%' },
          animate: { ...base.animate, y: 0 },
          exit: { ...base.exit, y: '-100%' },
        }
      case 'left':
        return {
          ...base,
          initial: { ...base.initial, x: '-100%' },
          animate: { ...base.animate, x: 0 },
          exit: { ...base.exit, x: '-100%' },
        }
      case 'right':
        return {
          ...base,
          initial: { ...base.initial, x: '100%' },
          animate: { ...base.animate, x: 0 },
          exit: { ...base.exit, x: '100%' },
        }
    }
  }, [side])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && dismissible && !preventClose) {
      onClose()
    }
  }

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    setIsDragging(false)
    if (onDragEndProp) {
      onDragEndProp(info)
      return
    }
    if (!dismissible || preventClose) return

    const threshold = 50
    let shouldClose = false
    switch (side) {
      case 'bottom':
        shouldClose = info.offset.y > threshold || info.velocity.y > 500
        break
      case 'top':
        shouldClose = info.offset.y < -threshold || info.velocity.y < -500
        break
      case 'left':
        shouldClose = info.offset.x < -threshold || info.velocity.x < -500
        break
      case 'right':
        shouldClose = info.offset.x > threshold || info.velocity.x > 500
        break
    }
    if (shouldClose) onClose()
  }

  const dragConstraints = React.useMemo(() => {
    switch (side) {
      case 'bottom':
        return { top: 0, bottom: 200 }
      case 'top':
        return { top: -200, bottom: 0 }
      case 'left':
        return { left: -200, right: 0 }
      case 'right':
        return { left: 0, right: 200 }
    }
  }, [side])

  const dragDirection = side === 'bottom' || side === 'top' ? 'y' : 'x'

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={handleBackdropClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className={cn(sheetVariants({ side, size }), className)}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: 30, stiffness: 300, duration: isDragging ? 0 : 0.3 }}
            drag={dismissible ? dragDirection : false}
            dragConstraints={dragConstraints}
            dragElastic={0.2}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            style={{ touchAction: dismissible ? 'none' : 'auto' }}
          >
            {showHandle && (side === 'bottom' || side === 'top') && (
              <div
                className={cn(
                  'flex justify-center py-3 cursor-grab active:cursor-grabbing',
                  side === 'top' ? 'order-last' : '',
                )}
              >
                <GripHorizontal className="h-5 w-5 text-gray-400" />
              </div>
            )}

            {showCloseButton && (
              <div
                className={cn(
                  'absolute z-10',
                  side === 'bottom'
                    ? 'top-4 right-4'
                    : side === 'top'
                      ? 'bottom-4 right-4'
                      : side === 'left'
                        ? 'top-4 right-4'
                        : 'top-4 left-4',
                )}
              >
                <TouchButton variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </TouchButton>
              </div>
            )}

            <div className="flex-1 overflow-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { MobileSheet, sheetVariants }
export type { MobileSheetProps }
