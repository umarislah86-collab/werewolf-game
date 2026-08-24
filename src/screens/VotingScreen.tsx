import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'
import PhaseHeader from '../components/PhaseHeader'
import PlayerList from '../components/PlayerList'
import Timer from '../components/Timer'
import { useAuth } from '../hooks/useAuth'
import { useGame } from '../hooks/useGame'
import { usePlayers } from '../hooks/usePlayers'
import { submitVote, forceVoteResolution } from '../services/voteService'

export default function VotingScreen() {
  const { gameId } = useParams<{ gameId: string }>()
  const { uid } = useAuth()
  const { game } = useGame(gameId)
  const { players } = usePlayers(gameId)
  const [selectedUid, setSelectedUid] = useState<string | null>(null)
  const [voted, setVoted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const me = players.find((p) => p.uid === uid)
  const isAlive = me?.isAlive ?? false
  const isLive = game?.settings.mode === 'live'
  const round = game?.voteRound ?? 1

  // Can't vote for self, can't vote for dead
  const disabledUids = players
    .filter((p) => !p.isAlive || p.uid === uid)
    .map((p) => p.uid)

  const livingPlayers = players.filter((p) => p.isAlive)

  const handleVote = async () => {
    if (!gameId || !uid || !selectedUid || submitting || !isAlive) return
    setSubmitting(true)
    try {
      await submitVote(gameId, round, uid, selectedUid)
      setVoted(true)
    } catch (e) {
      console.error('Vote error:', e)
      setSubmitting(false)
    }
  }

  const handleTimerExpire = async () => {
    if (!gameId || !game || game.creatorUid !== uid) return
    if (game.phase !== 'voting') return
    // Force resolve with current votes
    await forceVoteResolution(gameId, round)
  }

  const votedPlayer = selectedUid ? players.find((p) => p.uid === selectedUid) : null

  return (
    <Layout>
      <div className="flex flex-col gap-5 animate-fade-in phase-transition">
        <PhaseHeader phase="voting" subtitle="Vote to eliminate a suspect" />

        {/* Timer (Live) */}
        {isLive && game?.phaseEndsAt && (
          <div className="text-center">
            <Timer endsAt={game.phaseEndsAt} onExpire={handleTimerExpire} />
          </div>
        )}

        {!isAlive ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">✝</div>
            <p className="text-[#8a7f6e] font-[Cinzel,serif]">
              You are dead. You may only observe.
            </p>
          </div>
        ) : voted ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="text-5xl">⚖️</div>
            <p className="text-green-500 font-[Cinzel,serif] font-bold">Vote cast</p>
            <p className="text-[#8a7f6e] font-[Cinzel,serif] text-sm">
              You voted for <span className="text-[#e8e0d0]">{votedPlayer?.displayName}</span>
            </p>
            <p className="text-[#5a5040] font-[Cinzel,serif] text-sm">
              Waiting for all votes...
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-[#8a7f6e] font-[Cinzel,serif] text-sm text-center">
              Choose a player to put on trial. Your vote is final.
            </p>

            <PlayerList
              players={livingPlayers}
              selectedUid={selectedUid}
              onSelect={setSelectedUid}
              disabledUids={disabledUids}
            />

            <Button
              variant="danger"
              fullWidth
              size="lg"
              onClick={handleVote}
              disabled={!selectedUid || submitting}
            >
              {submitting ? 'Casting Vote...' : 'Cast Vote'}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}
