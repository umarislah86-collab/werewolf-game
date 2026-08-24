import {
  doc,
  collection,
  getDocs,
  getDoc,
  writeBatch,
  increment,
  query,
  where,
} from 'firebase/firestore'
import { getFirebaseDb } from '../firebase'
import type { Game, Player, NightAction, PrivateData, Vote } from '../types/game'
import { resolveNight } from './nightResolver'
import { resolveVotes } from './voteResolver'
import { checkWinConditionWithRoles } from './winCondition'

export async function runNightResolution(gameId: string, night: number): Promise<void> {
  const db = getFirebaseDb()

  // Read all night actions for this night
  const actionsSnap = await getDocs(
    query(collection(db, `games/${gameId}/nightActions`), where('night', '==', night))
  )
  const actions: NightAction[] = actionsSnap.docs.map((d) => d.data() as NightAction)

  // Read all players
  const playersSnap = await getDocs(collection(db, `games/${gameId}/players`))
  const players: Player[] = playersSnap.docs.map((d) => d.data() as Player)

  // Read all private data
  const privateSnap = await getDocs(collection(db, `games/${gameId}/private`))
  const privateDataMap: Record<string, PrivateData> = {}
  for (const d of privateSnap.docs) {
    privateDataMap[d.id] = d.data() as PrivateData
  }

  // Get game settings
  const gameSnap = await getDoc(doc(db, `games/${gameId}`))
  const game = gameSnap.data() as Game

  // Run resolution logic
  const resolution = resolveNight(game, players, actions, privateDataMap)

  // Build role map for win condition check
  const roleMap: Record<string, string> = {}
  for (const [uid, pd] of Object.entries(privateDataMap)) {
    roleMap[uid] = pd.role
  }

  const batch = writeBatch(db)

  // Write night resolution
  batch.set(doc(db, `games/${gameId}/nightResolution/${night}`), {
    night,
    killedUid: resolution.killedUid,
    werewolfPunished: resolution.werewolfPunished,
    punishedWerewolfUid: resolution.punishedWerewolfUid,
    resolvedAt: Date.now(),
  })

  // Write seer results to private docs
  for (const [seerUid, seerResult] of Object.entries(resolution.seerResults)) {
    const privateRef = doc(db, `games/${gameId}/private/${seerUid}`)
    batch.update(privateRef, {
      [`seerResults.${night}`]: seerResult,
    })
  }

  // Apply death if any
  let updatedPlayers = [...players]
  if (resolution.killedUid) {
    const playerRef = doc(db, `games/${gameId}/players/${resolution.killedUid}`)
    batch.update(playerRef, { isAlive: false })
    batch.update(doc(db, `games/${gameId}`), { livingPlayerCount: increment(-1) })
    updatedPlayers = updatedPlayers.map((p) =>
      p.uid === resolution.killedUid ? { ...p, isAlive: false } : p
    )
  }

  // Check win condition
  const winCheck = checkWinConditionWithRoles(updatedPlayers, roleMap)

  if (winCheck.hasWinner) {
    batch.update(doc(db, `games/${gameId}`), {
      phase: 'game_over',
      winner: winCheck.winner,
      resolving: false,
    })
  } else {
    batch.update(doc(db, `games/${gameId}`), {
      phase: 'morning',
      resolving: false,
      phaseStartedAt: Date.now(),
      phaseEndsAt: null,
    })
  }

  await batch.commit()
}

export async function runVoteResolution(
  gameId: string,
  round: number,
  night: number
): Promise<void> {
  const db = getFirebaseDb()

  const votesSnap = await getDocs(
    query(collection(db, `games/${gameId}/votes`), where('round', '==', round))
  )
  const votes = votesSnap.docs.map((d) => d.data() as Vote)

  const playersSnap = await getDocs(collection(db, `games/${gameId}/players`))
  const players: Player[] = playersSnap.docs.map((d) => d.data() as Player)

  const privateSnap = await getDocs(collection(db, `games/${gameId}/private`))
  const roleMap: Record<string, string> = {}
  for (const d of privateSnap.docs) {
    const pd = d.data() as PrivateData
    roleMap[d.id] = pd.role
  }

  const voteResult = resolveVotes(votes, players)

  const batch = writeBatch(db)

  batch.set(doc(db, `games/${gameId}/voteResult/${round}`), {
    round,
    night,
    counts: voteResult.counts,
    eliminatedUid: voteResult.eliminatedUid,
    isTie: voteResult.isTie,
    resolvedAt: Date.now(),
  })

  let updatedPlayers = [...players]
  if (!voteResult.isTie && voteResult.eliminatedUid) {
    const playerRef = doc(db, `games/${gameId}/players/${voteResult.eliminatedUid}`)
    batch.update(playerRef, { isAlive: false })
    batch.update(doc(db, `games/${gameId}`), { livingPlayerCount: increment(-1) })
    updatedPlayers = updatedPlayers.map((p) =>
      p.uid === voteResult.eliminatedUid ? { ...p, isAlive: false } : p
    )
  }

  // Check win condition
  const winCheck = checkWinConditionWithRoles(updatedPlayers, roleMap)

  if (winCheck.hasWinner) {
    batch.update(doc(db, `games/${gameId}`), {
      phase: 'game_over',
      winner: winCheck.winner,
      resolving: false,
    })
  } else if (voteResult.isTie) {
    // Re-vote: restart voting phase with incremented round
    const gameSnap = await getDoc(doc(db, `games/${gameId}`))
    const gameData = gameSnap.data() as Game
    const newRound = gameData.voteRound + 1
    batch.update(doc(db, `games/${gameId}`), {
      phase: 'vote_result',
      resolving: false,
      voteRound: newRound,
    })
  } else {
    batch.update(doc(db, `games/${gameId}`), {
      phase: 'vote_result',
      resolving: false,
    })
  }

  await batch.commit()
}
