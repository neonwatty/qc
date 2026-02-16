'use client'

import { Suspense, useState, useRef, useEffect, type ReactNode } from 'react'

function LoadingFallback({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className || 'h-8 w-full'}`} />
}

interface LazyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

export function LazyWrapper({ children, fallback, className }: LazyWrapperProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className={className}>
            <LoadingFallback className="h-8 w-full" />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  )
}

interface UseViewportLazyLoadingProps {
  threshold?: number
  rootMargin?: string
}

export function useViewportLazyLoading({ threshold = 0.1, rootMargin = '50px' }: UseViewportLazyLoadingProps = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element || hasBeenVisible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setHasBeenVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold, rootMargin, hasBeenVisible])

  return { ref: elementRef, isVisible, hasBeenVisible }
}

interface ViewportLazyComponentProps {
  children: ReactNode
  fallback?: ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
}

export function ViewportLazyComponent({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  className,
}: ViewportLazyComponentProps) {
  const { ref, isVisible } = useViewportLazyLoading({ threshold, rootMargin })

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : fallback || <LoadingFallback />}
    </div>
  )
}
