import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-accent hover:bg-accent-hover text-white shadow-orange hover:shadow-orange-lg',
  secondary: 'bg-transparent border border-accent text-accent hover:bg-accent hover:text-white',
  ghost: 'bg-bg-secondary hover:bg-gray-700 text-white border border-gray-700',
  danger: 'bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30',
  success: 'bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/30',
}

const sizes = {
  sm: 'text-xs px-3 py-1.5 rounded-lg',
  md: 'text-sm px-5 py-2.5 rounded-xl',
  lg: 'text-base px-7 py-3.5 rounded-xl',
}

const Button = forwardRef(function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}, ref) {
  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
})

export default Button
