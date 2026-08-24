export type GameMode = 'live' | 'busy'
export type GamePhase =
  | 'lobby'
  | 'role_reveal'
  | 'night'
  | 'night_resolution'
  | 'morning'
  | 'discussion'
  | 'voting'
  | 'vote_result'
  | 'game_over'

export type RoleId = 'werewolf' | 'seer' | 'drunk_seer' | 'knight' | 'villager'
export type Team = 'werewolf' | 'village'

export interface GameSettings {
  mode: GameMode
  playerCount: number
  roleCounts: Record<RoleId, number>
  // Timers (Live mode)
  nightDuration: number
  discussionDuration: number
  votingDuration: number
  // Knight settings
  knightConsecutiveProtect: boolean
  knightSelfProtect: boolean
  // Drunk Seer
  drunkSeerAccuracy: number
  // Misc
  revealRolesToDead: boolean
  // Discussion extension (Live mode)
  discussionExtension: {
    threshold: 'majority' | 'any'
    maxExtensions: number
    minutesToAdd: number
  }
}

export interface Game {
  id: string
  creatorUid: string
  mode: GameMode
  phase: GamePhase
  night: number
  voteRound: number
  phaseStartedAt: number | null
  phaseEndsAt: number | null
  resolving: boolean
  winner: Team | null
  settings: GameSettings
  createdAt: number
  startedAt: number | null
  requiredActionCount: number
  submittedActionCount: number
  livingPlayerCount: number
  discussionExtensionsUsed: number
}

export interface Player {
  uid: string
  displayName: string
  isAlive: boolean
  isCreator: boolean
  hasSubmittedAction: boolean
  joinedAt: number
}

export interface PrivateData {
  role: RoleId
  seerResults: Record<number, { targetUid: string; result: 'werewolf' | 'not_werewolf' }>
  knightLastTargetUid: string | null
}

export interface NightAction {
  uid: string
  targetUid: string
  role: RoleId
  night: number
  submittedAt: number
}

export interface NightResolution {
  night: number
  killedUid: string | null
  werewolfPunished: boolean
  punishedWerewolfUid: string | null
  resolvedAt: number
}

export interface Vote {
  uid: string
  targetUid: string
  round: number
  submittedAt: number
}

export interface VoteResult {
  round: number
  night: number
  counts: Record<string, number>
  eliminatedUid: string | null
  isTie: boolean
  resolvedAt: number
}

export interface ChatMessage {
  id: string
  senderUid: string
  senderName: string
  message: string
  timestamp: number
  isSystem?: boolean
}
