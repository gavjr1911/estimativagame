import { useSyncStore } from '../../stores'
import { formatCodeForDisplay } from '../../utils'

interface SyncStatusProps {
  onClick?: () => void
}

/**
 * Indicador compacto de status de sincronização para o header
 * Mostra apenas o código e um indicador visual de conexão
 */
export default function SyncStatus({ onClick }: SyncStatusProps) {
  const { role, status, code, viewerCount } = useSyncStore()

  // Não mostrar se não está sincronizando
  if (role === 'none' || !code) {
    return null
  }

  const isConnected = status === 'connected'
  const isHost = role === 'host'

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
        isConnected
          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      }`}
    >
      {/* Indicador de conexão */}
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />

      {/* Código */}
      <span className="font-mono">{formatCodeForDisplay(code)}</span>

      {/* Contador de viewers (apenas para host) */}
      {isHost && viewerCount > 0 && (
        <span className="flex items-center gap-0.5 opacity-80">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {viewerCount}
        </span>
      )}
    </button>
  )
}
