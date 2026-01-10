import { useSyncStore } from '../../stores'

/**
 * Badge que aparece quando o usuário está no modo viewer (somente leitura)
 * Compacto e discreto para não atrapalhar a visualização
 */
export default function ViewerBadge() {
  const { role } = useSyncStore()

  if (role !== 'viewer') {
    return null
  }

  return (
    <div className="flex justify-center py-1">
      <div className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full flex items-center gap-1.5 border border-blue-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="font-medium">Modo Visualização</span>
      </div>
    </div>
  )
}
