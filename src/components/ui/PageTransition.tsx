'use client'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
  // Temporarily disable animations to fix content loading issue
  return <div className={className}>{children}</div>
}

export default PageTransition
