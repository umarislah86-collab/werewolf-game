import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'
import PhaseHeader from '../components/PhaseHeader'
import { useAuth } from '../hooks/useAuth'
import { useGame } from '../hooks/useGame'
import { usePlayers } from '../hooks/usePlayers'
import { startGame } from '../services/gameService'
import { assignRoles } from '../services/assignRoles'
import { sendMessage } from '../services/chatService'

export default function LobbyScreen() {
  const { gameId } = useParams<{ gameId: string }>()
  const { uid } = useAuth()
  const { game } = useGame(gameId)
  const { players } = usePlayers(gameId)
  const [starting, setStarting] = useState(false)
  const [copied, setCopied] = useState(false)

  const me = players.find((p) => p.uid === uid)
  const isCreator = me?.isCreator ?? false
  const playerCount = game?.settings.playerCount ?? 0
  const canStart = players.length === playerCount && isCreator && !starting

  const handleCopy = () => {
    if (gameId) {
      navigator.clipboard.writeText(gameId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleStart = async () => {
    if (!gameId || !game || !canStart) return
    setStarting(true)
    try {
      await assignRoles(gameId, players, game.settings)
      await startGame(gameId)
      await sendMessage(gameId, 'system', 'System', 'The game has begun. May the village prosper.', true)
    } catch (e) {
      console.error('Start error:', e)
      setStarting(false)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-fade-in">
        <PhaseHeader phase="lobby" subtitle="Waiting for players to join" />

        {/* Game ID */}
        <div className="bg-[#1a1612] border border-[#3a3020] rounded p-4 text-center">
          <p className="text-[#8a7f6e] text-xs font-[Cinzel,serif] uppercase tracking-widest mb-1">
            Game ID
          </p>
          <p
            className="text-[#d97706] font-[Cinzel,serif] text-3xl font-bold tracking-widest"
            style={{ textShadow: '0 0 20px rgba(217,119,6,0.4)' }}
          >
            {gameId}
          </p>
          <button
            onClick={handleCopy}
            className="mt-2 text-xs text-[#8a7f6e] font-[Cinzel,serif] hover:text-[#e8e0d0] transition-colors"
          >
            {copied ? '✓ Copied!' : 'Tap to copy'}
          </button>
        </div>

        {/* Player list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#8a7f6e] text-xs font-[Cinzel,serif] uppercase tracking-widest">
              Players
            </h3>
            <span className="text-[#8a7f6e] text-xs font-[Cinzel,serif]">
              {players.length}/{playerCount}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {players.map((player) => (
              <div
                key={player.uid}
                className="flex items-center gap-3 bg-[#1a1612] border border-[#3a3020] rounded px-4 py-3"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[#e8e0d0] font-[Cinzel,serif] flex-1">
                  {player.displayName}
                </span>
                {player.isCreator && (
                  <span className="text-[#d97706] text-xs font-[Cinzel,serif]">
                    Host
                  </span>
                )}
                {player.uid === uid && (
                  <span className="text-[#8a7f6e] text-xs font-[Cinzel,serif]">
                    (you)
                  </span>
                )}
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: Math.max(0, playerCount - players.length) }).map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center gap-3 bg-[#1a1612] border border-[#2a2010] border-dashed rounded px-4 py-3"
                >
                  <div className="w-2 h-2 rounded-full bg-[#3a3020]" />
                  <span className="text-[#5a5040] font-[Cinzel,serif] text-sm">
                    Waiting for player...
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {isCreator && (
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleStart}
            disabled={!canStart}
          >
            {starting
              ? 'Starting...'
              : players.length < playerCount
              ? `Need ${playerCount - players.length} more player(s)`
              : 'Start Game'}
          </Button>
        )}

        {!isCreator && (
          <p className="text-[#8a7f6e] text-sm text-center font-[Cinzel,serif]">
            Waiting for the host to start the game...
          </p>
        )}
      </div>
    </Layout>
  )
}
