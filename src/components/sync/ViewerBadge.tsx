import { useSyncStore } from '../../stores'

/**
 * Badge que aparece quando o usuário está no modo viewer (somente leitura)
 */
export default function ViewerBadge() {
  const { role } = useSyncStore()

  if (role !== 'viewer') {
    return null
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="bg-blue-500/90 text-white text-xs px-4 py-1.5 rounded-b-lg flex items-center gap-2 shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>Modo Visualização</span>
      </div>
    </div>
  )
}
