const configs = {
  veg: { label: 'Veg', classes: 'bg-green-500/20 text-green-400 border-green-500/30', dot: 'bg-green-500' },
  nonveg: { label: 'Non-Veg', classes: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-500' },
  popular: { label: '🔥 Popular', classes: 'bg-orange-500/20 text-orange-400 border-orange-500/30', dot: 'bg-orange-500' },
  new: { label: '✨ New', classes: 'bg-blue-500/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-500' },
  active: { label: 'Active', classes: 'bg-green-500/20 text-green-400 border-green-500/30', dot: 'bg-green-500' },
  paused: { label: 'Paused', classes: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-500' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-500' },
  confirmed: { label: 'Confirmed', classes: 'bg-blue-500/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-500' },
  preparing: { label: 'Preparing', classes: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-500' },
  delivered: { label: 'Delivered', classes: 'bg-green-500/20 text-green-400 border-green-500/30', dot: 'bg-green-500' },
  diet: { label: 'Diet', classes: 'bg-purple-500/20 text-purple-400 border-purple-500/30', dot: 'bg-purple-500' },
  student: { label: 'Student', classes: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', dot: 'bg-cyan-500' },
  office: { label: 'Office', classes: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', dot: 'bg-indigo-500' },
  family: { label: 'Family', classes: 'bg-pink-500/20 text-pink-400 border-pink-500/30', dot: 'bg-pink-500' },
}

export default function Badge({ variant = 'veg', label, showDot = true, className = '' }) {
  const config = configs[variant] || { label: variant, classes: 'bg-gray-500/20 text-gray-400 border-gray-500/30', dot: 'bg-gray-500' }
  const displayLabel = label || config.label

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.classes} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {displayLabel}
    </span>
  )
}
