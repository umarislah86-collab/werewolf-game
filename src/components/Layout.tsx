import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  className?: string
}

export default function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-start bg-[#0f0d0a] ${className}`}
    >
      <div className="w-full max-w-[430px] flex flex-col flex-1 min-h-screen px-4 py-6">
        {children}
      </div>
    </div>
  )
}
