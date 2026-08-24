import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'
import PhaseHeader from '../components/PhaseHeader'
import { useAuth } from '../hooks/useAuth'
import { useGame } from '../hooks/useGame'
import { usePrivateData } from '../hooks/usePrivateData'
import { getDisplayRole } from '../roles/registry'
import { advancePhase } from '../services/gameService'

export default function RoleRevealScreen() {
  const { gameId } = useParams<{ gameId: string }>()
  const { uid } = useAuth()
  const { game } = useGame(gameId)
  const { privateData } = usePrivateData(gameId, uid)
  const [revealed, setRevealed] = useState(false)
  const [ready, setReady] = useState(false)

  const rawRole = privateData?.role
  const displayRole = rawRole ? getDisplayRole(rawRole) : null
  const isCreator = game?.creatorUid === uid

  const handleReady = async () => {
    if (!gameId || !game || !isCreator) return
    setReady(true)
    await advancePhase(gameId, 'night', { night: 1 })
  }

  const roleCardStyle: Record<string, string> = {
    werewolf: 'border-[#991b1b] bg-[#1a0a0a]',
    seer: 'border-[#7c3aed] bg-[#120d1a]',
    knight: 'border-[#d97706] bg-[#1a1508]',
    villager: 'border-[#3a3020] bg-[#1a1612]',
  }

  const cardStyle = displayRole
    ? roleCardStyle[displayRole.id] ?? roleCardStyle.villager
    : roleCardStyle.villager

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-fade-in">
        <PhaseHeader phase="role_reveal" subtitle="Your role has been assigned" />

        {!revealed ? (
          <div className="flex flex-col items-center gap-6">
            <div
              className={`w-full border-2 border-[#3a3020] rounded-lg p-8 text-center cursor-pointer hover:border-[#5a4a30] transition-colors`}
              onClick={() => setRevealed(true)}
            >
              <div className="text-6xl mb-4">🂠</div>
              <p className="text-[#8a7f6e] font-[Cinzel,serif] text-sm">
                Tap to reveal your role
              </p>
              <p className="text-[#5a5040] font-[Cinzel,serif] text-xs mt-1">
                Make sure no one is looking over your shoulder
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Role Card */}
            <div className={`border-2 ${cardStyle} rounded-lg p-6 text-center`}>
              <div className="text-5xl mb-3">{displayRole?.icon}</div>
              <h2
                className="font-[Cinzel,serif] text-2xl font-bold tracking-widest mb-2"
                style={{ color: displayRole?.color }}
              >
                {displayRole?.displayName}
              </h2>
              <p className="text-[#8a7f6e] font-[Cinzel,serif] text-sm">
                {displayRole?.description}
              </p>
            </div>

            {/* WW Warning */}
            {rawRole === 'werewolf' && (
              <div className="bg-[#1a0a0a] border border-[#991b1b] rounded-lg p-4">
                <p className="text-[#dc2626] font-[Cinzel,serif] text-sm font-bold mb-1">
                  ⚠ Warning
                </p>
                <p className="text-[#e8e0d0] font-[Cinzel,serif] text-sm">
                  You do NOT know who the other werewolves are. Each night, you independently pick a kill target.
                </p>
                <p className="text-[#e8e0d0] font-[Cinzel,serif] text-sm mt-2">
                  If ALL werewolves choose the same target — that player is killed. If there is ANY disagreement — a random werewolf dies instead.
                </p>
              </div>
            )}

            {/* Knight Note */}
            {rawRole === 'knight' && (
              <div className="bg-[#1a1508] border border-[#d97706] rounded-lg p-4">
                <p className="text-[#d97706] font-[Cinzel,serif] text-sm">
                  You receive NO confirmation when your protection is used. You may accidentally protect a werewolf.
                </p>
              </div>
            )}

            {/* Team info */}
            <div className="bg-[#1a1612] border border-[#3a3020] rounded p-3 text-center">
              <span className="text-[#8a7f6e] text-xs font-[Cinzel,serif] uppercase tracking-widest">
                Team: {' '}
              </span>
              <span
                className="text-sm font-[Cinzel,serif] font-bold"
                style={{ color: displayRole?.team === 'werewolf' ? '#991b1b' : '#4ade80' }}
              >
                {displayRole?.team === 'werewolf' ? 'Werewolf' : 'Village'}
              </span>
            </div>

            {isCreator && (
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleReady}
                disabled={ready}
              >
                {ready ? 'Advancing...' : 'Begin Night Phase →'}
              </Button>
            )}
            {!isCreator && (
              <p className="text-[#8a7f6e] text-sm text-center font-[Cinzel,serif]">
                Waiting for the host to begin...
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
