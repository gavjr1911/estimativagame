interface NumberSelectorProps {
  min?: number
  max: number
  value: number | null
  onChange: (value: number) => void
  disabled?: boolean
  columns?: number
}

export default function NumberSelector({
  min = 0,
  max,
  value,
  onChange,
  disabled = false,
  columns = 7,
}: NumberSelectorProps) {
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  return (
    <div
      className="flex flex-wrap justify-center gap-2"
      style={{ maxWidth: `${columns * 48}px` }}
    >
      {numbers.map(num => (
        <button
          key={num}
          type="button"
          disabled={disabled}
          onClick={() => onChange(num)}
          className={`
            w-10 h-10 flex items-center justify-center rounded-full
            font-mono font-medium text-sm
            transition-all duration-150
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
            ${
              value === num
                ? 'bg-gold text-felt-dark border-2 border-gold-light shadow-chip'
                : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
            }
          `}
        >
          {num}
        </button>
      ))}
    </div>
  )
}
