import type { ReactNode } from 'react'

interface HeaderProps {
  title: string
  leftAction?: ReactNode
  rightAction?: ReactNode
}

export default function Header({ title, leftAction, rightAction }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-felt-dark/90 backdrop-blur-sm border-b border-white/10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="w-10 flex justify-start">
          {leftAction}
        </div>

        <h1 className="font-sans text-xl font-bold text-white">
          {title}
        </h1>

        <div className="w-10 flex justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  )
}
