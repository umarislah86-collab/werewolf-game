import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'
import PhaseHeader from '../components/PhaseHeader'
import Timer from '../components/Timer'
import ChatPanel from '../components/ChatPanel'
import { useAuth } from '../hooks/useAuth'
import { useGame } from '../hooks/useGame'
import { usePlayers } from '../hooks/usePlayers'
import { advancePhase } from '../services/gameService'
import { sendMessage } from '../services/chatService'
import { updateDoc, doc } from 'firebase/firestore'
import { getFirebaseDb } from '../firebase'

export default function DiscussionScreen() {
  const { gameId } = useParams<{ gameId: string }>()
  const { uid } = useAuth()
  const { game } = useGame(gameId)
  const { players } = usePlayers(gameId)
  const [advancing, setAdvancing] = useState(false)
  const [extending, setExtending] = useState(false)

  const isCreator = game?.creatorUid === uid
  const isLive = game?.settings.mode === 'live'
  const me = players.find((p) => p.uid === uid)
  const night = game?.night ?? 1

  const extensionsUsed = game?.discussionExtensionsUsed ?? 0
  const maxExtensions = game?.settings.discussionExtension.maxExtensions ?? 3
  const canExtend = isLive && extensionsUsed < maxExtensions

  const handleStartVoting = async () => {
    if (!gameId || !game) return
    setAdvancing(true)
    await advancePhase(gameId, 'voting')
  }

  const handleTimerExpire = async () => {
    if (!gameId || !game || game.creatorUid !== uid) return
    if (game.phase !== 'discussion') return
    await advancePhase(gameId, 'voting')
  }

  const handleExtend = async () => {
    if (!gameId || !game || !canExtend) return
    setExtending(true)
    const db = getFirebaseDb()
    const minutesToAdd = game.settings.discussionExtension.minutesToAdd
    const newEndsAt = (game.phaseEndsAt ?? Date.now()) + minutesToAdd * 60 * 1000
    await updateDoc(doc(db, `games/${gameId}`), {
      phaseEndsAt: newEndsAt,
      discussionExtensionsUsed: (game.discussionExtensionsUsed ?? 0) + 1,
    })
    await sendMessage(
      gameId,
      'system',
      'System',
      `Discussion extended by ${minutesToAdd} minute(s). (${extensionsUsed + 1}/${maxExtensions})`,
      true
    )
    setExtending(false)
  }

  return (
    <Layout>
      <div className="flex flex-col gap-5 animate-fade-in phase-transition">
        <PhaseHeader phase="discussion" night={night} subtitle="Discuss and find the werewolves" />

        {/* Timer (Live mode) */}
        {isLive && game?.phaseEndsAt && (
          <div className="text-center">
            <Timer endsAt={game.phaseEndsAt} onExpire={handleTimerExpire} />
          </div>
        )}

        {/* Alive players */}
        <div>
          <p className="text-[#8a7f6e] text-xs font-[Cinzel,serif] uppercase tracking-widest mb-2">
            Living Players
          </p>
          <div className="flex flex-col gap-1">
            {players.map((player) => (
              <div
                key={player.uid}
                className={`flex items-center gap-2 px-3 py-2 rounded border font-[Cinzel,serif] text-sm ${
                  player.isAlive
                    ? 'bg-[#1a1612] border-[#3a3020] text-[#e8e0d0]'
                    : 'bg-[#0f0d0a] border-[#2a2010] text-[#5a5040] line-through'
                }`}
              >
                {!player.isAlive && <span>✝</span>}
                <span className="flex-1">{player.displayName}</span>
                {player.uid === uid && (
                  <span className="text-[#5a5040] text-xs">(you)</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {isCreator && !isLive && (
            <Button
              variant="primary"
              fullWidth
              onClick={handleStartVoting}
              disabled={advancing}
            >
              {advancing ? 'Starting...' : 'Start Voting →'}
            </Button>
          )}

          {isLive && canExtend && (
            <Button
              variant="ghost"
              fullWidth
              onClick={handleExtend}
              disabled={extending}
            >
              {extending
                ? 'Extending...'
                : `Extend Discussion (+${game?.settings.discussionExtension.minutesToAdd}m) — ${extensionsUsed}/${maxExtensions} used`}
            </Button>
          )}
        </div>

        {/* Chat */}
        {uid && (
          <ChatPanel
            gameId={gameId!}
            uid={uid}
            displayName={me?.displayName ?? ''}
          />
        )}
      </div>
    </Layout>
  )
}
