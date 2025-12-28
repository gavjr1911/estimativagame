interface CounterProps {
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean
  label?: string
}

export default function Counter({
  value,
  min = 0,
  max,
  onChange,
  disabled = false,
  label,
}: CounterProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <span className="text-sm text-white/70">{label}</span>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={`
            w-10 h-10 flex items-center justify-center rounded-full
            font-bold text-xl transition-all duration-150
            ${disabled || value <= min
              ? 'bg-white/5 text-white/30 cursor-not-allowed'
              : 'bg-white/10 text-white hover:bg-white/20 hover:scale-110 active:scale-95'
            }
          `}
        >
          −
        </button>

        <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-felt-dark/80 border border-white/20">
          <span className="font-mono text-2xl font-bold text-white">
            {value}
          </span>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className={`
            w-10 h-10 flex items-center justify-center rounded-full
            font-bold text-xl transition-all duration-150
            ${disabled || value >= max
              ? 'bg-white/5 text-white/30 cursor-not-allowed'
              : 'bg-white/10 text-white hover:bg-white/20 hover:scale-110 active:scale-95'
            }
          `}
        >
          +
        </button>
      </div>
    </div>
  )
}
