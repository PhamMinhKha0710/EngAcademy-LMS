import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
    variant?: ButtonVariant
    size?: ButtonSize
    children: ReactNode
    className?: string
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary-500 text-white hover:brightness-110 active:scale-[0.98]',
    secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-[0.98]',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500/10 active:scale-[0.98]',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.98]',
}

/* Min 44px touch target for 11-12yo (WCAG AAA) - see docs/UX-KIDS.md */
const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-4 py-2.5 text-sm rounded-lg min-h-touch min-w-touch',
    md: 'px-6 py-3 text-body-lg rounded-xl min-h-touch min-w-touch',
    lg: 'px-8 py-4 text-lg rounded-xl min-h-touch min-w-touch',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', children, className = '', disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={`
                    inline-flex items-center justify-center font-medium
                    transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2
                    ${variantClasses[variant]}
                    ${sizeClasses[size]}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${className}
                `}
                disabled={disabled}
                {...props}
            >
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'

export default Button
