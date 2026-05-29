import { motion } from 'framer-motion'

export default function Card({
  children,
  className = '',
  hover = true,
  glass = false,
  onClick,
  padding = true,
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 8px 40px rgba(255,140,66,0.2)' } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`
        ${glass ? 'glass' : 'bg-bg-card border border-gray-800'}
        ${padding ? 'p-6' : ''}
        ${hover ? 'cursor-pointer' : ''}
        rounded-2xl shadow-card transition-all
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
