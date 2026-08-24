import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'danger' | 'gold' | 'ghost' | 'purple'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const variants: Record<Variant, string> = {
  primary:
    'bg-[#991b1b] hover:bg-[#b91c1c] active:bg-[#7f1d1d] text-white border border-[#7f1d1d]',
  danger:
    'bg-[#7f1d1d] hover:bg-[#991b1b] active:bg-[#6b1111] text-white border border-[#991b1b]',
  gold:
    'bg-[#d97706] hover:bg-[#b45309] active:bg-[#92400e] text-black font-semibold border border-[#b45309]',
  ghost:
    'bg-transparent hover:bg-[#1a1612] active:bg-[#221e18] text-[#e8e0d0] border border-[#3a3020]',
  purple:
    'bg-[#7c3aed] hover:bg-[#6d28d9] active:bg-[#5b21b6] text-white border border-[#6d28d9]',
}

const sizes: Record<string, string> = {
  sm: 'text-sm py-2 px-4 min-h-[36px]',
  md: 'text-base py-3 px-6 min-h-[48px]',
  lg: 'text-lg py-4 px-8 min-h-[56px]',
}

export default function Button({
  variant = 'primary',
  children,
  fullWidth = false,
  size = 'md',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded font-[Cinzel,serif] tracking-wide cursor-pointer
        transition-colors duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
