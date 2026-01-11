import { useSyncStore } from '../../stores'
import { formatCodeForDisplay } from '../../utils'

interface SyncBarProps {
  onReconnect?: () => void
}

/**
 * Barra de status de sincronização abaixo do header
 * Mostra código, status de conexão e viewers
 */
export default function SyncBar({ onReconnect }: SyncBarProps) {
  const { role, status, code, viewerCount } = useSyncStore()

  // Não mostrar se não está sincronizando
  if (role === 'none' || !code) {
    return null
  }

  const isConnected = status === 'connected'
  const isConnecting = status === 'connecting'
  const isHost = role === 'host'
  const isViewer = role === 'viewer'

  const handleClick = () => {
    if (!isConnected && !isConnecting && onReconnect) {
      onReconnect()
    }
  }

  // Cores baseadas no status
  const statusColor = isConnected
    ? 'bg-green-500'
    : 'bg-yellow-500'

  const statusBgColor = isConnected
    ? 'bg-green-500/10 border-green-500/30'
    : 'bg-yellow-500/10 border-yellow-500/30'

  const canReconnect = !isConnected && !isConnecting && onReconnect

  return (
    <div className={`border-b ${statusBgColor}`}>
      <div
        onClick={canReconnect ? handleClick : undefined}
        className={`flex items-center justify-center gap-3 px-4 py-2 ${
          canReconnect ? 'cursor-pointer hover:bg-white/5' : ''
        }`}
      >
        {/* Indicador de status */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${statusColor} ${
              !isConnected ? 'animate-pulse' : ''
            }`}
          />
          <span className="text-xs text-white/70">
            {isConnecting
              ? 'Conectando...'
              : isConnected
                ? 'Conectado'
                : 'Desconectado'}
          </span>
        </div>

        {/* Separador */}
        <span className="text-white/20">|</span>

        {/* Código */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-white/50">Sala:</span>
          <span className="text-xs font-mono font-medium text-white">
            {formatCodeForDisplay(code)}
          </span>
        </div>

        {/* Viewers (apenas para host) */}
        {isHost && (
          <>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 text-white/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span className="text-xs text-white/70">
                {viewerCount} {viewerCount === 1 ? 'visualizando' : 'visualizando'}
              </span>
            </div>
          </>
        )}

        {/* Indicador de modo visualização */}
        {isViewer && (
          <>
            <span className="text-white/20">|</span>
            <span className="text-xs text-yellow-400/80">Modo visualização</span>
          </>
        )}

        {/* Ícone de reconexão quando desconectado */}
        {canReconnect && (
          <>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1 text-yellow-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="text-xs">Reconectar</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
