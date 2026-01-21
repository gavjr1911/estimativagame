import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Button, Input } from '../ui'
import { useSyncStore, useGameStore } from '../../stores'
import { normalizeCode, isValidCode } from '../../utils'
import { useSupabaseStatus } from '../../hooks'

interface JoinModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function JoinModal({ isOpen, onClose }: JoinModalProps) {
  const navigate = useNavigate()
  const { error, status, joinGame, setError } = useSyncStore()
  const { isConfigured, isOnline } = useSupabaseStatus()
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeCode(e.target.value)
    setCode(normalized)
    setError(null)
  }

  const handleJoin = async () => {
    if (!isValidCode(code)) {
      setError('Código deve ter 6 caracteres')
      return
    }

    setIsLoading(true)
    const game = await joinGame(code)
    setIsLoading(false)

    if (game) {
      // Salvar jogo no store local
      useGameStore.setState({ game })
      onClose()
      // Viewers vão para a tela de acompanhamento
      navigate('/acompanhar')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidCode(code)) {
      handleJoin()
    }
  }

  // Se não está configurado ou offline
  if (!isConfigured || !isOnline) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Entrar em Partida">
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            </svg>
          </div>
          <p className="text-white/70 mb-2">
            {!isOnline ? 'Sem conexão com a internet' : 'Modo online não disponível'}
          </p>
          <p className="text-sm text-white/50">
            {!isOnline
              ? 'Conecte-se à internet para entrar em uma partida.'
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
    <Modal isOpen={isOpen} onClose={onClose} title="Entrar em Partida">
      <div>
        <p className="text-white/70 mb-4 text-center">
          Digite o código de 6 caracteres compartilhado pelo host:
        </p>

        {/* Input do código */}
        <div className="mb-4">
          <Input
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            placeholder="ABC123"
            maxLength={6}
            className="text-center text-2xl font-mono tracking-widest uppercase"
            autoFocus
          />
        </div>

        {/* Erro */}
        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        {/* Status */}
        {status === 'connecting' && (
          <p className="text-white/50 text-sm text-center mb-4">
            Conectando...
          </p>
        )}

        {/* Botões */}
        <Button
          fullWidth
          onClick={handleJoin}
          disabled={!isValidCode(code) || isLoading}
        >
          {isLoading ? 'Entrando...' : 'Entrar na Partida'}
        </Button>

        <button
          onClick={onClose}
          className="w-full mt-3 text-white/50 hover:text-white text-sm transition-colors py-2"
        >
          Cancelar
        </button>
      </div>
    </Modal>
  )
}
