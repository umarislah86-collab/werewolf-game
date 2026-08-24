import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'
import { getFirebaseDb } from '../firebase'
import type { Game, GameSettings } from '../types/game'

function generateGameId(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // exclude 0/O, 1/I/L
  let result = 'WOLF-'
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export const DEFAULT_SETTINGS: GameSettings = {
  mode: 'busy',
  playerCount: 6,
  roleCounts: {
    werewolf: 1,
    seer: 1,
    drunk_seer: 0,
    knight: 1,
    villager: 3,
  },
  nightDuration: 120,
  discussionDuration: 240,
  votingDuration: 60,
  knightConsecutiveProtect: false,
  knightSelfProtect: false,
  drunkSeerAccuracy: 50,
  revealRolesToDead: false,
  discussionExtension: {
    threshold: 'majority',
    maxExtensions: 3,
    minutesToAdd: 1,
  },
}

export async function createGame(
  creatorUid: string,
  displayName: string,
  settings: GameSettings
): Promise<string> {
  const db = getFirebaseDb()
  let gameId = generateGameId()

  // Ensure unique ID
  let attempts = 0
  while (attempts < 10) {
    const existing = await getDoc(doc(db, `games/${gameId}`))
    if (!existing.exists()) break
    gameId = generateGameId()
    attempts++
  }

  const now = Date.now()
  const game: Game = {
    id: gameId,
    creatorUid,
    mode: settings.mode,
    phase: 'lobby',
    night: 0,
    voteRound: 1,
    phaseStartedAt: null,
    phaseEndsAt: null,
    resolving: false,
    winner: null,
    settings,
    createdAt: now,
    startedAt: null,
    requiredActionCount: 0,
    submittedActionCount: 0,
    livingPlayerCount: 0,
    discussionExtensionsUsed: 0,
  }

  await setDoc(doc(db, `games/${gameId}`), game)

  // Add creator as a player
  await setDoc(doc(db, `games/${gameId}/players/${creatorUid}`), {
    uid: creatorUid,
    displayName,
    isAlive: true,
    isCreator: true,
    hasSubmittedAction: false,
    joinedAt: now,
  })

  return gameId
}

export async function joinGame(
  gameId: string,
  uid: string,
  displayName: string
): Promise<{ success: boolean; error?: string }> {
  const db = getFirebaseDb()
  const gameRef = doc(db, `games/${gameId}`)
  const gameSnap = await getDoc(gameRef)

  if (!gameSnap.exists()) {
    return { success: false, error: 'Game not found' }
  }

  const game = gameSnap.data() as Game
  if (game.phase !== 'lobby') {
    return { success: false, error: 'Game has already started' }
  }

  await setDoc(doc(db, `games/${gameId}/players/${uid}`), {
    uid,
    displayName,
    isAlive: true,
    isCreator: false,
    hasSubmittedAction: false,
    joinedAt: Date.now(),
  })

  return { success: true }
}

export async function startGame(gameId: string): Promise<void> {
  const db = getFirebaseDb()
  await updateDoc(doc(db, `games/${gameId}`), {
    phase: 'role_reveal',
    startedAt: Date.now(),
  })
}

export async function advancePhase(
  gameId: string,
  newPhase: Game['phase'],
  extra?: Partial<Game>
): Promise<void> {
  const db = getFirebaseDb()
  const now = Date.now()
  const gameSnap = await getDoc(doc(db, `games/${gameId}`))
  const game = gameSnap.data() as Game

  let phaseEndsAt: number | null = null
  if (game.settings.mode === 'live') {
    if (newPhase === 'night') phaseEndsAt = now + game.settings.nightDuration * 1000
    if (newPhase === 'discussion') phaseEndsAt = now + game.settings.discussionDuration * 1000
    if (newPhase === 'voting') phaseEndsAt = now + game.settings.votingDuration * 1000
  }

  await updateDoc(doc(db, `games/${gameId}`), {
    phase: newPhase,
    phaseStartedAt: now,
    phaseEndsAt,
    submittedActionCount: 0,
    ...extra,
  })
}

export function subscribeToGame(
  gameId: string,
  callback: (game: Game | null) => void
): () => void {
  const db = getFirebaseDb()
  return onSnapshot(doc(db, `games/${gameId}`), (snap) => {
    if (snap.exists()) {
      callback(snap.data() as Game)
    } else {
      callback(null)
    }
  })
}
