import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { getFirebaseDb } from '../firebase'
import Layout from '../components/Layout'
import Button from '../components/Button'
import PhaseHeader from '../components/PhaseHeader'
import { useAuth } from '../hooks/useAuth'
import { useGame } from '../hooks/useGame'
import { usePlayers } from '../hooks/usePlayers'
import { advancePhase } from '../services/gameService'
import type { VoteResult } from '../types/game'

export default function VoteResultScreen() {
  const { gameId } = useParams<{ gameId: string }>()
  const { uid } = useAuth()
  const { game } = useGame(gameId)
  const { players } = usePlayers(gameId)
  const [voteResult, setVoteResult] = useState<VoteResult | null>(null)
  const [advancing, setAdvancing] = useState(false)

  const isCreator = game?.creatorUid === uid
  const round = game?.voteRound ?? 1
  const night = game?.night ?? 1

  useEffect(() => {
    if (!gameId) return
    const db = getFirebaseDb()
    // Listen to both round and round-1 to catch the resolved result
    const unsub = onSnapshot(
      doc(db, `games/${gameId}/voteResult/${round - 1}`),
      (snap) => {
        if (snap.exists()) setVoteResult(snap.data() as VoteResult)
      }
    )
    const unsub2 = onSnapshot(
      doc(db, `games/${gameId}/voteResult/${round}`),
      (snap) => {
        if (snap.exists()) setVoteResult(snap.data() as VoteResult)
      }
    )
    return () => { unsub(); unsub2() }
  }, [gameId, round])

  const eliminatedPlayer = voteResult?.eliminatedUid
    ? players.find((p) => p.uid === voteResult.eliminatedUid)
    : null

  const handleContinue = async () => {
    if (!gameId || !game || !isCreator) return
    setAdvancing(true)
    if (voteResult?.isTie) {
      // Re-vote
      await advancePhase(gameId, 'voting')
    } else {
      // Next night
      await advancePhase(gameId, 'night', { night: night + 1 })
    }
  }

  const sortedVotes = voteResult
    ? Object.entries(voteResult.counts)
        .sort(([, a], [, b]) => b - a)
        .map(([uid, count]) => ({
          uid,
          count,
          name: players.find((p) => p.uid === uid)?.displayName ?? uid,
        }))
    : []

  return (
    <Layout>
      <div className="flex flex-col gap-5 animate-fade-in phase-transition">
        <PhaseHeader phase="vote_result" />

        {voteResult ? (
          <>
            {/* Verdict */}
            <div
              className={`rounded-lg p-5 text-center border-2 ${
                voteResult.isTie
                  ? 'border-[#d97706] bg-[#1a1508]'
                  : eliminatedPlayer
                  ? 'border-[#991b1b] bg-[#1a0a0a]'
                  : 'border-[#3a3020] bg-[#1a1612]'
              }`}
            >
              {voteResult.isTie ? (
                <>
                  <p className="text-[#d97706] font-[Cinzel,serif] font-bold text-xl mb-1">
                    ⚖️ Tie
                  </p>
                  <p className="text-[#8a7f6e] font-[Cinzel,serif] text-sm">
                    The village could not agree. Re-voting begins.
                  </p>
                </>
              ) : eliminatedPlayer ? (
                <>
                  <p className="text-[#dc2626] font-[Cinzel,serif] font-bold text-xl mb-1">
                    The Village Has Spoken
                  </p>
                  <p className="text-[#e8e0d0] font-[Cinzel,serif] text-2xl font-bold">
                    {eliminatedPlayer.displayName}
                  </p>
                  <p className="text-[#8a7f6e] font-[Cinzel,serif] text-sm mt-2">
                    has been eliminated
                  </p>
                </>
              ) : (
                <p className="text-[#8a7f6e] font-[Cinzel,serif]">No result</p>
              )}
            </div>

            {/* Vote counts */}
            {sortedVotes.length > 0 && (
              <div>
                <p className="text-[#8a7f6e] text-xs font-[Cinzel,serif] uppercase tracking-widest mb-2">
                  Vote Count
                </p>
                <div className="flex flex-col gap-1">
                  {sortedVotes.map(({ uid: vUid, count, name }) => (
                    <div
                      key={vUid}
                      className="flex items-center justify-between bg-[#1a1612] border border-[#3a3020] rounded px-3 py-2"
                    >
                      <span className="text-[#e8e0d0] font-[Cinzel,serif] text-sm">{name}</span>
                      <span className="text-[#d97706] font-[Cinzel,serif] font-bold">
                        {count} vote{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isCreator && (
              <Button
                variant="primary"
                fullWidth
                onClick={handleContinue}
                disabled={advancing}
              >
                {advancing
                  ? 'Advancing...'
                  : voteResult.isTie
                  ? 'Begin Re-vote →'
                  : 'Next Night →'}
              </Button>
            )}
            {!isCreator && (
              <p className="text-[#8a7f6e] text-sm text-center font-[Cinzel,serif]">
                Waiting for the host...
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-[#8a7f6e] font-[Cinzel,serif]">Counting votes...</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
