import { type HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', padding = 'md', children, ...props }, ref) => {
    const baseStyles = 'rounded-xl transition-all duration-200'

    const variants = {
      default: 'bg-felt-dark/80 backdrop-blur-sm shadow-card border border-white/10',
      elevated: 'bg-felt-dark/90 backdrop-blur-sm shadow-card-hover border border-white/15',
      outlined: 'bg-transparent border-2 border-white/20',
    }

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    }

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
