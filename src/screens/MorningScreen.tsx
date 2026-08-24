import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { getFirebaseDb } from '../firebase'
import Layout from '../components/Layout'
import Button from '../components/Button'
import PhaseHeader from '../components/PhaseHeader'
import Timer from '../components/Timer'
import ChatPanel from '../components/ChatPanel'
import { useAuth } from '../hooks/useAuth'
import { useGame } from '../hooks/useGame'
import { usePlayers } from '../hooks/usePlayers'
import { advancePhase } from '../services/gameService'
import type { NightResolution } from '../types/game'

export default function MorningScreen() {
  const { gameId } = useParams<{ gameId: string }>()
  const { uid } = useAuth()
  const { game } = useGame(gameId)
  const { players } = usePlayers(gameId)
  const [resolution, setResolution] = useState<NightResolution | null>(null)
  const [advancing, setAdvancing] = useState(false)

  const night = game?.night ?? 1
  const isCreator = game?.creatorUid === uid
  const isLive = game?.settings.mode === 'live'

  useEffect(() => {
    if (!gameId || !night) return
    const db = getFirebaseDb()
    const unsub = onSnapshot(
      doc(db, `games/${gameId}/nightResolution/${night}`),
      (snap) => {
        if (snap.exists()) setResolution(snap.data() as NightResolution)
      }
    )
    return unsub
  }, [gameId, night])

  const killedPlayer = resolution?.killedUid
    ? players.find((p) => p.uid === resolution.killedUid)
    : null

  const handleAdvance = async () => {
    if (!gameId || !game || !isCreator) return
    setAdvancing(true)
    await advancePhase(gameId, 'discussion')
  }

  const handleTimerExpire = async () => {
    if (!gameId || !game || game.creatorUid !== uid) return
    if (game.phase !== 'morning') return
    await advancePhase(gameId, 'discussion')
  }

  return (
    <Layout>
      <div className="flex flex-col gap-5 animate-fade-in phase-transition">
        <PhaseHeader phase="morning" night={night} />

        <div className="text-center py-4">
          <div
            className="text-6xl mb-4"
            style={{ filter: 'drop-shadow(0 0 20px rgba(217,119,6,0.6))' }}
          >
            ☀️
          </div>
          <h2 className="font-[Cinzel,serif] text-xl text-[#d97706] font-bold mb-2">
            Dawn Breaks
          </h2>
        </div>

        {/* Death announcement */}
        <div
          className={`rounded-lg p-5 text-center border-2 ${
            killedPlayer
              ? 'border-[#991b1b] bg-[#1a0a0a]'
              : 'border-[#3a3020] bg-[#1a1612]'
          }`}
        >
          {killedPlayer ? (
            <>
              <p className="text-[#dc2626] font-[Cinzel,serif] font-bold text-lg mb-1">
                Death in the Night
              </p>
              <p className="text-[#e8e0d0] font-[Cinzel,serif] text-xl font-bold">
                {killedPlayer.displayName}
              </p>
              <p className="text-[#8a7f6e] font-[Cinzel,serif] text-sm mt-2">
                was found dead this morning
              </p>
            </>
          ) : (
            <>
              <p className="text-green-500 font-[Cinzel,serif] font-bold text-lg mb-1">
                A Peaceful Night
              </p>
              <p className="text-[#8a7f6e] font-[Cinzel,serif] text-sm">
                Nobody died last night
              </p>
            </>
          )}
        </div>

        {/* Timer (Live) */}
        {isLive && game?.phaseEndsAt && (
          <div className="text-center">
            <p className="text-[#8a7f6e] text-xs font-[Cinzel,serif] mb-1">Discussion begins in</p>
            <Timer endsAt={game.phaseEndsAt} onExpire={handleTimerExpire} />
          </div>
        )}

        {/* Creator manual advance (Busy mode) */}
        {!isLive && isCreator && (
          <Button
            variant="gold"
            fullWidth
            onClick={handleAdvance}
            disabled={advancing}
          >
            {advancing ? 'Advancing...' : 'Begin Discussion →'}
          </Button>
        )}

        {/* Chat */}
        {uid && (
          <ChatPanel
            gameId={gameId!}
            uid={uid}
            displayName={players.find((p) => p.uid === uid)?.displayName ?? ''}
            collapsed
          />
        )}
      </div>
    </Layout>
  )
}
