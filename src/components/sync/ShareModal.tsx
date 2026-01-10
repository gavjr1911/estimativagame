import { useState } from 'react'
import { Modal, Button } from '../ui'
import { useSyncStore, useGameStore } from '../../stores'
import { formatCodeForDisplay } from '../../utils'
import { useSupabaseStatus } from '../../hooks'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const { game } = useGameStore()
  const { role, status, code, error, viewerCount, shareGame, leaveGame } = useSyncStore()
  const { isConfigured, isOnline } = useSupabaseStatus()
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const isSharing = role === 'host' && code

  const handleShare = async () => {
    if (!game) return

    setIsLoading(true)
    await shareGame(game)
    setIsLoading(false)
  }

  const handleStopSharing = async () => {
    setIsLoading(true)
    await leaveGame()
    setIsLoading(false)
    onClose()
  }

  const handleCopyCode = async () => {
    if (!code) return

    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback para browsers antigos
      const textArea = document.createElement('textarea')
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Se não está configurado ou offline
  if (!isConfigured || !isOnline) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Compartilhar Partida">
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            </svg>
          </div>
          <p className="text-white/70 mb-2">
            {!isOnline ? 'Sem conexão com a internet' : 'Compartilhamento não disponível'}
          </p>
          <p className="text-sm text-white/50">
            {!isOnline
              ? 'Conecte-se à internet para compartilhar a partida.'
              : 'O modo multi-dispositivo não está configurado.'}
          </p>
        </div>
        <Button variant="secondary" fullWidth onClick={onClose} className="mt-4">
          Fechar
        </Button>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compartilhar Partida">
      {isSharing ? (
        // Já está compartilhando
        <div className="text-center">
          <p className="text-white/70 mb-4">
            Compartilhe este código com outros jogadores:
          </p>

          {/* Código grande */}
          <div className="bg-white/5 rounded-2xl p-6 mb-4">
            <p className="text-4xl font-mono font-bold text-gold tracking-widest">
              {formatCodeForDisplay(code)}
            </p>
          </div>

          {/* Botão copiar */}
          <button
            onClick={handleCopyCode}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors mb-4"
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copiar Código</span>
              </>
            )}
          </button>

          {/* Viewers conectados */}
          <div className="flex items-center justify-center gap-2 text-white/50 text-sm mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>
              {viewerCount === 0
                ? 'Ninguém assistindo ainda'
                : viewerCount === 1
                  ? '1 pessoa assistindo'
                  : `${viewerCount} pessoas assistindo`}
            </span>
          </div>

          {/* Status da conexão */}
          <div className="flex items-center justify-center gap-2 text-sm mb-6">
            <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-white/50">
              {status === 'connected' ? 'Conectado' : 'Conectando...'}
            </span>
          </div>

          {/* Parar compartilhamento */}
          <button
            onClick={handleStopSharing}
            disabled={isLoading}
            className="text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            Parar Compartilhamento
          </button>
        </div>
      ) : (
        // Ainda não está compartilhando
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>

          <p className="text-white/70 mb-2">
            Compartilhe esta partida
          </p>
          <p className="text-sm text-white/50 mb-6">
            Outros jogadores poderão acompanhar o placar e as estimativas em tempo real.
          </p>

          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}

          <Button
            fullWidth
            onClick={handleShare}
            disabled={isLoading || !game}
          >
            {isLoading ? 'Gerando código...' : 'Gerar Código de Compartilhamento'}
          </Button>

          <button
            onClick={onClose}
            className="mt-4 text-white/50 hover:text-white text-sm transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </Modal>
  )
}
