import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', fullWidth = false, children, ...props }, ref) => {
    const baseStyles = 'font-semibold rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'

    const variants = {
      primary: 'bg-linear-to-b from-gold-light to-gold-dark text-felt-dark shadow-chip hover:scale-105 border-2 border-gold-light/50',
      secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:scale-105',
      ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/10',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    const widthClass = fullWidth ? 'w-full' : ''

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
