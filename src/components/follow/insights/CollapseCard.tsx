import { useState, type ReactNode } from 'react'

interface CollapseCardProps {
  title: string
  icon: string
  children: ReactNode
  defaultOpen?: boolean
  badge?: string
}

/**
 * Card colapsável para seções de insights
 */
export default function CollapseCard({
  title,
  icon,
  children,
  defaultOpen = false,
  badge,
}: CollapseCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      {/* Header clicável */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-white font-medium">{title}</span>
          {badge && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>

        <svg
          className={`w-5 h-5 text-white/50 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Conteúdo colapsável */}
      <div
        className={`transition-all duration-200 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-0 border-t border-white/10">
          {children}
        </div>
      </div>
    </div>
  )
}
