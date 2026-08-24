import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { getFirebaseDb } from '../firebase'
import Layout from '../components/Layout'
import PhaseHeader from '../components/PhaseHeader'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { useGame } from '../hooks/useGame'
import { usePlayers } from '../hooks/usePlayers'
import { ROLE_REGISTRY } from '../roles/registry'
import type { PrivateData, RoleId } from '../types/game'
import { useNavigate } from 'react-router-dom'

export default function GameOverScreen() {
  const { gameId } = useParams<{ gameId: string }>()
  const { uid } = useAuth()
  const { game } = useGame(gameId)
  const { players } = usePlayers(gameId)
  const navigate = useNavigate()
  const [allPrivate, setAllPrivate] = useState<Record<string, PrivateData>>({})

  useEffect(() => {
    if (!gameId) return
    const db = getFirebaseDb()
    getDocs(collection(db, `games/${gameId}/private`)).then((snap) => {
      const map: Record<string, PrivateData> = {}
      for (const d of snap.docs) {
        map[d.id] = d.data() as PrivateData
      }
      setAllPrivate(map)
    })
  }, [gameId])

  const winner = game?.winner
  const isWerewolfWin = winner === 'werewolf'

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-fade-in phase-transition pb-8">
        <PhaseHeader phase="game_over" />

        {/* Winner Banner */}
        <div
          className={`rounded-lg p-6 text-center border-2 ${
            isWerewolfWin
              ? 'border-[#991b1b] bg-[#1a0a0a]'
              : 'border-green-700 bg-[#0a1a0a]'
          }`}
          style={{
            boxShadow: isWerewolfWin
              ? '0 0 30px rgba(153,27,27,0.4)'
              : '0 0 30px rgba(74,222,128,0.2)',
          }}
        >
          <div className="text-5xl mb-3">
            {isWerewolfWin ? '🐺' : '🏆'}
          </div>
          <h2
            className={`font-[Cinzel_Decorative,serif] text-2xl font-bold tracking-widest ${
              isWerewolfWin ? 'text-[#dc2626]' : 'text-green-400'
            }`}
          >
            {isWerewolfWin ? 'Werewolves Win' : 'Village Wins'}
          </h2>
          <p className="text-[#8a7f6e] font-[Cinzel,serif] text-sm mt-2">
            {isWerewolfWin
              ? 'The wolves have claimed the village.'
              : 'The village has driven out the wolves!'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#1a1612] border border-[#3a3020] rounded p-3">
            <p className="text-[#d97706] font-bold font-[Cinzel,serif] text-xl">
              {game?.night ?? 0}
            </p>
            <p className="text-[#8a7f6e] text-xs font-[Cinzel,serif]">Nights</p>
          </div>
          <div className="bg-[#1a1612] border border-[#3a3020] rounded p-3">
            <p className="text-[#d97706] font-bold font-[Cinzel,serif] text-xl">
              {players.length}
            </p>
            <p className="text-[#8a7f6e] text-xs font-[Cinzel,serif]">Players</p>
          </div>
          <div className="bg-[#1a1612] border border-[#3a3020] rounded p-3">
            <p className="text-[#d97706] font-bold font-[Cinzel,serif] text-xl">
              {players.filter((p) => !p.isAlive).length}
            </p>
            <p className="text-[#8a7f6e] text-xs font-[Cinzel,serif]">Deaths</p>
          </div>
        </div>

        {/* Final Roles */}
        <div>
          <p className="text-[#8a7f6e] text-xs font-[Cinzel,serif] uppercase tracking-widest mb-2">
            All Roles Revealed
          </p>
          <div className="flex flex-col gap-2">
            {players.map((player) => {
              const pd = allPrivate[player.uid]
              const rawRole = pd?.role as RoleId | undefined
              const roleDef = rawRole ? ROLE_REGISTRY[rawRole] : null

              return (
                <div
                  key={player.uid}
                  className={`flex items-center justify-between bg-[#1a1612] border rounded px-3 py-3 ${
                    !player.isAlive ? 'border-[#2a2010] opacity-60' : 'border-[#3a3020]'
                  }`}
                >
                  <span className="font-[Cinzel,serif] text-sm">
                    {!player.isAlive && (
                      <span className="text-[#5a5040] mr-2">✝</span>
                    )}
                    <span className="text-[#e8e0d0]">{player.displayName}</span>
                    {player.uid === uid && (
                      <span className="text-[#5a5040] text-xs ml-1">(you)</span>
                    )}
                  </span>
                  {roleDef ? (
                    <span
                      className="text-sm font-[Cinzel,serif] font-bold"
                      style={{ color: roleDef.color }}
                    >
                      {roleDef.icon} {roleDef.displayName}
                    </span>
                  ) : (
                    <span className="text-[#5a5040] text-xs font-[Cinzel,serif]">
                      Unknown
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <Button variant="ghost" fullWidth onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </div>
    </Layout>
  )
}
