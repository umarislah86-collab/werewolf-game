import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { getFirebaseDb } from '../firebase'
import Layout from '../components/Layout'
import Button from '../components/Button'
import PhaseHeader from '../components/PhaseHeader'
import PlayerList from '../components/PlayerList'
import Timer from '../components/Timer'
import { useAuth } from '../hooks/useAuth'
import { useGame } from '../hooks/useGame'
import { usePlayers } from '../hooks/usePlayers'
import { usePrivateData } from '../hooks/usePrivateData'
import { useNightActions } from '../hooks/useNightActions'
import { submitNightAction } from '../services/nightService'
import { advancePhase } from '../services/gameService'
import { getDisplayRole } from '../roles/registry'

export default function NightScreen() {
  const { gameId } = useParams<{ gameId: string }>()
  const { uid } = useAuth()
  const { game } = useGame(gameId)
  const { players } = usePlayers(gameId)
  const { privateData } = usePrivateData(gameId, uid)
  const night = game?.night ?? 1
  const { count: submittedCount } = useNightActions(gameId, night)

  const [selectedUid, setSelectedUid] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Restore submitted state on reconnect
  useEffect(() => {
    if (!gameId || !uid || !night) return
    const db = getFirebaseDb()
    getDoc(doc(db, `games/${gameId}/nightActions/${night}_${uid}`)).then((snap) => {
      if (snap.exists()) setSubmitted(true)
    })
  }, [gameId, uid, night])

  const me = players.find((p) => p.uid === uid)
  const rawRole = privateData?.role
  const displayRole = rawRole ? getDisplayRole(rawRole) : null
  const isAlive = me?.isAlive ?? false
  const hasNightAction = displayRole?.hasNightAction && isAlive

  const requiredCount = game?.requiredActionCount ?? 0
  const isLive = game?.settings.mode === 'live'

  const getDisabledUids = (): string[] => {
    if (!uid || !rawRole || !privateData) return []

    if (rawRole === 'werewolf') {
      // WW can't target self or dead
      return players.filter((p) => !p.isAlive || p.uid === uid).map((p) => p.uid)
    }

    if (rawRole === 'seer' || rawRole === 'drunk_seer') {
      // Seer can't target self
      return players.filter((p) => !p.isAlive || p.uid === uid).map((p) => p.uid)
    }

    if (rawRole === 'knight') {
      const disabledList = players.filter((p) => !p.isAlive).map((p) => p.uid)
      // Can't target self unless setting allows
      if (!game?.settings.knightSelfProtect) {
        disabledList.push(uid)
      }
      // Can't target same player consecutively unless setting allows
      if (!game?.settings.knightConsecutiveProtect && privateData.knightLastTargetUid) {
        disabledList.push(privateData.knightLastTargetUid)
      }
      return disabledList
    }

    return []
  }

  const handleSubmit = async () => {
    if (!gameId || !uid || !rawRole || !selectedUid || submitting) return
    setSubmitting(true)
    try {
      await submitNightAction(gameId, night, uid, selectedUid, rawRole)
      setSubmitted(true)
    } catch (e) {
      console.error('Submit error:', e)
      setSubmitting(false)
    }
  }

  // Live mode: auto-advance when timer expires (creator handles)
  const handleTimerExpire = async () => {
    if (!gameId || !game || game.creatorUid !== uid) return
    if (game.phase !== 'night') return
    await advancePhase(gameId, 'night_resolution')
  }

  const livingPlayers = players.filter((p) => p.isAlive)

  return (
    <Layout>
      <div className="flex flex-col gap-5 animate-fade-in phase-transition">
        <PhaseHeader phase="night" night={night} />

        {/* Timer (Live mode) */}
        {isLive && game?.phaseEndsAt && (
          <div className="text-center">
            <Timer endsAt={game.phaseEndsAt} onExpire={handleTimerExpire} />
          </div>
        )}

        {/* Action count (Busy mode) */}
        {!isLive && (
          <div className="text-center bg-[#1a1612] border border-[#3a3020] rounded p-3">
            <p className="text-[#8a7f6e] font-[Cinzel,serif] text-sm">
              Actions submitted: {submittedCount}/{requiredCount}
            </p>
          </div>
        )}

        {!hasNightAction || !isAlive ? (
          <VillagerWaiting />
        ) : submitted ? (
          <SubmittedWaiting submittedCount={submittedCount} requiredCount={requiredCount} />
        ) : (
          <div className="flex flex-col gap-4">
            <NightActionInstruction role={rawRole ?? 'villager'} />

            {rawRole === 'werewolf' && (
              <div className="bg-[#1a0a0a] border border-[#7f1d1d] rounded-lg p-3">
                <p className="text-[#dc2626] font-[Cinzel,serif] text-xs">
                  ⚠ If all werewolves choose the SAME target, that player is killed. Any disagreement means a random werewolf dies.
                </p>
              </div>
            )}

            <PlayerList
              players={livingPlayers}
              selectedUid={selectedUid}
              onSelect={setSelectedUid}
              disabledUids={getDisabledUids()}
            />

            <Button
              variant={rawRole === 'werewolf' ? 'danger' : rawRole === 'knight' ? 'gold' : 'purple'}
              fullWidth
              size="lg"
              onClick={handleSubmit}
              disabled={!selectedUid || submitting}
            >
              {submitting ? 'Submitting...' : getActionLabel(rawRole ?? 'villager')}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}

function VillagerWaiting() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="text-6xl animate-pulse">🌙</div>
      <p className="text-[#8a7f6e] font-[Cinzel,serif] text-center">
        The village sleeps...
      </p>
      <p className="text-[#5a5040] font-[Cinzel,serif] text-sm text-center">
        Await the dawn
      </p>
    </div>
  )
}

function SubmittedWaiting({ submittedCount, requiredCount }: { submittedCount: number; requiredCount: number }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="text-5xl">✓</div>
      <p className="text-green-500 font-[Cinzel,serif]">Action submitted.</p>
      <p className="text-[#8a7f6e] font-[Cinzel,serif] text-sm">
        Waiting for others... ({submittedCount}/{requiredCount})
      </p>
    </div>
  )
}

function NightActionInstruction({ role }: { role: string }) {
  const labels: Record<string, string> = {
    werewolf: 'Choose your target to eliminate tonight.',
    seer: 'Choose a player to investigate.',
    drunk_seer: 'Choose a player to investigate.',
    knight: 'Choose a player to protect tonight.',
  }
  return (
    <p className="text-[#8a7f6e] font-[Cinzel,serif] text-sm text-center">
      {labels[role] ?? ''}
    </p>
  )
}

function getActionLabel(role: string): string {
  const labels: Record<string, string> = {
    werewolf: 'Mark for Death',
    seer: 'Investigate',
    drunk_seer: 'Investigate',
    knight: 'Protect',
  }
  return labels[role] ?? 'Submit'
}
