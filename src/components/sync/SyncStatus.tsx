import { useSyncStore } from '../../stores'
import { formatCodeForDisplay } from '../../utils'

interface SyncStatusProps {
  onClick?: () => void
  compact?: boolean
}

export default function SyncStatus({ onClick, compact = false }: SyncStatusProps) {
  const { role, status, code, viewerCount } = useSyncStore()

  // Não mostrar se não está sincronizando
  if (role === 'none' || !code) {
    return null
  }

  const isConnected = status === 'connected'
  const isHost = role === 'host'

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors ${
          isConnected
            ? 'bg-green-500/20 text-green-400'
            : 'bg-yellow-500/20 text-yellow-400'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
        {isHost ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {viewerCount > 0 && <span>{viewerCount}</span>}
          </>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
        isConnected
          ? 'bg-green-500/10 border border-green-500/30 text-green-400'
          : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
      {isHost ? (
        <>
          <span>Compartilhando</span>
          <span className="font-mono text-xs opacity-70">{formatCodeForDisplay(code)}</span>
          {viewerCount > 0 && (
            <span className="flex items-center gap-1 text-xs opacity-70">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {viewerCount}
            </span>
          )}
        </>
      ) : (
        <>
          <span>Visualizando</span>
          <span className="font-mono text-xs opacity-70">{formatCodeForDisplay(code)}</span>
        </>
      )}
    </button>
  )
}
