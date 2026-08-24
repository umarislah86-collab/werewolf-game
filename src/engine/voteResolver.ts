import type { Vote, Player } from '../types/game'

export interface VoteResolutionResult {
  counts: Record<string, number>
  eliminatedUid: string | null
  isTie: boolean
}

export function resolveVotes(votes: Vote[], players: Player[]): VoteResolutionResult {
  const counts: Record<string, number> = {}

  for (const vote of votes) {
    counts[vote.targetUid] = (counts[vote.targetUid] ?? 0) + 1
  }

  if (Object.keys(counts).length === 0) {
    return { counts, eliminatedUid: null, isTie: false }
  }

  const maxVotes = Math.max(...Object.values(counts))
  const topCandidates = Object.entries(counts)
    .filter(([, count]) => count === maxVotes)
    .map(([uid]) => uid)
    .filter((uid) => players.find((p) => p.uid === uid)?.isAlive)

  if (topCandidates.length > 1) {
    return { counts, eliminatedUid: null, isTie: true }
  }

  return { counts, eliminatedUid: topCandidates[0] ?? null, isTie: false }
}
