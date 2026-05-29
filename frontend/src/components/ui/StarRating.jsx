import { useState } from 'react'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

export default function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = 18,
  showValue = false,
  count = 5,
}) {
  const [hovered, setHovered] = useState(0)

  const display = readonly ? value : (hovered || value)

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: count }).map((_, i) => {
        const starValue = i + 1
        const filled = starValue <= display
        const halfFilled = !filled && starValue - 0.5 <= display

        return (
          <motion.button
            key={i}
            type="button"
            disabled={readonly}
            whileHover={!readonly ? { scale: 1.2 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
            onClick={() => onChange && onChange(starValue)}
            onMouseEnter={() => !readonly && setHovered(starValue)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Star
              size={size}
              className={`transition-colors ${
                filled
                  ? 'fill-accent text-accent'
                  : 'fill-transparent text-gray-700'
              }`}
            />
          </motion.button>
        )
      })}
      {showValue && (
        <span className="ml-1.5 text-sm font-semibold text-accent">
          {value > 0 ? value.toFixed(1) : ''}
        </span>
      )}
    </div>
  )
}
