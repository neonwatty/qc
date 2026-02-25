'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { optimizeForTouch, ensureTouchTarget } from '@/lib/touch-interactions'
import { hapticFeedback } from '@/lib/haptics'

const touchButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation select-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90 active:bg-primary/95',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/95',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        link: 'text-primary underline-offset-4 hover:underline active:underline',
        floating:
          'bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:bg-primary/90 active:bg-primary/95',
        rounded: 'rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90 active:bg-primary/95',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-11 rounded-md px-3 text-xs',
        lg: 'h-14 rounded-md px-8 text-base',
        xl: 'h-16 rounded-md px-10 text-lg',
        icon: 'h-11 w-11',
        iconLg: 'h-14 w-14',
        fab: 'h-14 w-14 rounded-full',
        wide: 'h-11 px-8 w-full',
      },
      haptic: {
        none: '',
        light: '',
        medium: '',
        heavy: '',
      },
      pressStyle: {
        none: '',
        scale: 'active:scale-95 transition-transform',
        lift: 'hover:translate-y-[-1px] active:translate-y-0 transition-transform',
        press: 'active:translate-y-[1px] transition-transform',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      haptic: 'none',
      pressStyle: 'scale',
    },
  },
)

export interface TouchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof touchButtonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  hapticFeedback?: 'light' | 'medium' | 'heavy'
}

const TouchButton = React.forwardRef<HTMLButtonElement, TouchButtonProps>(
  (
    {
      className,
      variant,
      size,
      pressStyle = 'scale',
      haptic,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      hapticFeedback: hapticFeedbackProp,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    const buttonRef = React.useRef<HTMLButtonElement>(null)

    const combinedRef = React.useCallback(
      (node: HTMLButtonElement) => {
        buttonRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref],
    )

    React.useEffect(() => {
      const element = buttonRef.current
      if (element) {
        const cleanup = optimizeForTouch(element, {
          enableRipple: pressStyle === 'scale',
          preventContextMenu: true,
        })
        ensureTouchTarget(element)
        return cleanup
      }
    }, [pressStyle])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (hapticFeedbackProp) {
        hapticFeedback.tap()
      }
      onClick?.(e)
    }

    const buttonContent = (
      <Comp
        className={cn(touchButtonVariants({ variant, size, haptic, pressStyle, className }))}
        ref={combinedRef}
        onClick={handleClick}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
        )}
        {leftIcon && !loading && <span className="flex-shrink-0">{leftIcon}</span>}
        <span className="flex-1 truncate">{children}</span>
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </Comp>
    )

    if (pressStyle === 'scale') {
      return (
        <motion.div
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1, ease: 'easeInOut' }}
          className="inline-flex"
        >
          {buttonContent}
        </motion.div>
      )
    }

    return buttonContent
  },
)
TouchButton.displayName = 'TouchButton'

const FAB = React.forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, size = 'fab', variant = 'floating', ...props }, ref) => (
    <TouchButton
      ref={ref}
      className={cn('fixed bottom-6 right-6 z-50 shadow-lg', className)}
      size={size}
      variant={variant}
      {...props}
    />
  ),
)
FAB.displayName = 'FAB'

const IconButton = React.forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, size = 'icon', variant = 'ghost', ...props }, ref) => (
    <TouchButton ref={ref} className={cn('flex-shrink-0', className)} size={size} variant={variant} {...props} />
  ),
)
IconButton.displayName = 'IconButton'

const PrimaryButton = React.forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, size = 'lg', variant = 'default', hapticFeedback: hf = 'light', ...props }, ref) => (
    <TouchButton
      ref={ref}
      className={cn('font-semibold', className)}
      size={size}
      variant={variant}
      hapticFeedback={hf}
      {...props}
    />
  ),
)
PrimaryButton.displayName = 'PrimaryButton'

const MobileButton = React.forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, size = 'lg', pressStyle = 'scale', ...props }, ref) => (
    <TouchButton ref={ref} className={cn('w-full', className)} size={size} pressStyle={pressStyle} {...props} />
  ),
)
MobileButton.displayName = 'MobileButton'

export { TouchButton, FAB, IconButton, PrimaryButton, MobileButton, touchButtonVariants }
