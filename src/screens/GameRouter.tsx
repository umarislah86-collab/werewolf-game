import { useParams, Navigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useGame } from '../hooks/useGame'
import { usePlayers } from '../hooks/usePlayers'
import { usePrivateData } from '../hooks/usePrivateData'
import { runNightResolution, runVoteResolution } from '../engine/gameEngine'
import LobbyScreen from './LobbyScreen'
import RoleRevealScreen from './RoleRevealScreen'
import NightScreen from './NightScreen'
import MorningScreen from './MorningScreen'
import DiscussionScreen from './DiscussionScreen'
import VotingScreen from './VotingScreen'
import VoteResultScreen from './VoteResultScreen'
import GameOverScreen from './GameOverScreen'
import Layout from '../components/Layout'

export default function GameRouter() {
  const { gameId } = useParams<{ gameId: string }>()
  const { uid, loading: authLoading } = useAuth()
  const { game, loading: gameLoading } = useGame(gameId)
  const { players, loading: playersLoading } = usePlayers(gameId)
  const { privateData: _privateData } = usePrivateData(gameId, uid)

  const isCreator = uid === game?.creatorUid
  const resolvingKey = `${game?.phase}:${game?.resolving}:${game?.night}:${game?.voteRound}`
  const lastResolved = useRef<string>('')

  useEffect(() => {
    if (!game || !gameId || !isCreator || !game.resolving) return
    if (lastResolved.current === resolvingKey) return
    lastResolved.current = resolvingKey

    if (game.phase === 'night_resolution') {
      runNightResolution(gameId, game.night).catch(console.error)
    } else if (game.phase === 'voting') {
      runVoteResolution(gameId, game.voteRound, game.night).catch(console.error)
    }
  }, [resolvingKey, isCreator, gameId])

  if (authLoading || gameLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <div className="text-4xl animate-pulse">🐺</div>
          <p className="text-[#8a7f6e] font-[Cinzel,serif]">Loading...</p>
        </div>
      </Layout>
    )
  }

  if (!game) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <p className="text-[#dc2626] font-[Cinzel,serif]">Game not found.</p>
          <a href="/" className="text-[#d97706] font-[Cinzel,serif] text-sm">
            Return Home
          </a>
        </div>
      </Layout>
    )
  }

  // Check if player is in the game
  const isPlayer = uid && players.some((p) => p.uid === uid)

  // If game started and player is not in the game, show join prompt
  if (!playersLoading && !isPlayer && game.phase === 'lobby') {
    return <Navigate to={`/join?gameId=${gameId}`} replace />
  }

  if (!playersLoading && !isPlayer && game.phase !== 'lobby') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <p className="text-[#8a7f6e] font-[Cinzel,serif] text-center">
            You are not a participant in this game.
          </p>
          <a href="/" className="text-[#d97706] font-[Cinzel,serif] text-sm">
            Return Home
          </a>
        </div>
      </Layout>
    )
  }

  // Seer results screen — show after morning for seers with new results
  // (handled inline in NightScreen after submission)

  switch (game.phase) {
    case 'lobby':
      return <LobbyScreen />

    case 'role_reveal':
      return <RoleRevealScreen />

    case 'night':
    case 'night_resolution':
      return <NightScreen />

    case 'morning':
      return <MorningScreen />

    case 'discussion':
      return <DiscussionScreen />

    case 'voting':
      return <VotingScreen />

    case 'vote_result':
      return <VoteResultScreen />

    case 'game_over':
      return <GameOverScreen />

    default:
      return (
        <Layout>
          <div className="flex flex-col items-center justify-center flex-1">
            <p className="text-[#8a7f6e] font-[Cinzel,serif]">
              Unknown phase: {game.phase}
            </p>
          </div>
        </Layout>
      )
  }
}
