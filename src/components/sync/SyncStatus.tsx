import { useSyncStore } from '../../stores'
import { formatCodeForDisplay } from '../../utils'

interface SyncStatusProps {
  onClick?: () => void
  onReconnect?: () => void
}

/**
 * Indicador compacto de status de sincronização para o header
 * Mostra apenas o código e um indicador visual de conexão
 * Permite reconexão manual ao clicar quando desconectado
 */
export default function SyncStatus({ onClick, onReconnect }: SyncStatusProps) {
  const { role, status, code, viewerCount } = useSyncStore()

  // Não mostrar se não está sincronizando
  if (role === 'none' || !code) {
    return null
  }

  const isConnected = status === 'connected'
  const isConnecting = status === 'connecting'
  const isHost = role === 'host'

  const handleClick = () => {
    // Se não estiver conectado e tiver função de reconexão, tentar reconectar
    if (!isConnected && !isConnecting && onReconnect) {
      onReconnect()
    } else if (onClick) {
      onClick()
    }
  }

  // Determinar cor e estado do indicador
  const getStatusStyles = () => {
    if (isConnected) {
      return {
        container: 'bg-green-500/20 text-green-400 border border-green-500/30',
        dot: 'bg-green-500',
        dotAnimation: '',
      }
    }
    if (isConnecting) {
      return {
        container: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        dot: 'bg-yellow-500',
        dotAnimation: 'animate-pulse',
      }
    }
    // error ou disconnected
    return {
      container:
        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 cursor-pointer hover:bg-yellow-500/30',
      dot: 'bg-yellow-500',
      dotAnimation: 'animate-pulse',
    }
  }

  const styles = getStatusStyles()

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${styles.container}`}
      title={
        !isConnected && !isConnecting
          ? 'Clique para reconectar'
          : isConnecting
            ? 'Conectando...'
            : 'Conectado'
      }
    >
      {/* Indicador de conexão */}
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot} ${styles.dotAnimation}`}
      />

      {/* Status text quando reconectando */}
      {isConnecting ? (
        <span className="font-medium">Conectando...</span>
      ) : (
        <>
          {/* Código */}
          <span className="font-mono">{formatCodeForDisplay(code)}</span>

          {/* Ícone de reconexão quando desconectado */}
          {!isConnected && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
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
          )}

          {/* Contador de viewers (apenas para host quando conectado) */}
          {isHost && isConnected && viewerCount > 0 && (
            <span className="flex items-center gap-0.5 opacity-80">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
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
              {viewerCount}
            </span>
          )}
        </>
      )}
    </button>
  )
}
