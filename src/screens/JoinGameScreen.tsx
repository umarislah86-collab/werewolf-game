import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { joinGame } from '../services/gameService'
import { getRoleImage } from '../roles/images'
import type { RoleId } from '../types/game'

const ROLE_GUIDE: { id: RoleId; name: string; team: string; color: string; desc: string }[] = [
  { id: 'werewolf', name: 'Werewolf', team: 'Werewolf', color: '#dc2626', desc: 'Silently eliminate villagers each night. Win when werewolves match or outnumber the village.' },
  { id: 'seer', name: 'Seer', team: 'Village', color: '#a78bfa', desc: 'Investigate one player each night to learn if they are a werewolf or not.' },
  { id: 'drunk_seer', name: 'Drunk Seer', team: 'Village', color: '#7c3aed', desc: 'Believes they are a Seer, but their readings are sometimes wrong. Unreliable insight.' },
  { id: 'knight', name: 'Knight', team: 'Village', color: '#d97706', desc: 'Protect one player each night from being killed. Cannot protect the same player twice in a row.' },
  { id: 'villager', name: 'Villager', team: 'Village', color: '#4ade80', desc: 'No special power. Use day discussion and voting to expose and eliminate the werewolves.' },
]

export default function JoinGameScreen() {
  const navigate = useNavigate()
  const { uid, loading: authLoading } = useAuth()
  const [gameId, setGameId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(false)

  const handleJoin = async () => {
    if (!uid) return
    const trimmedId = gameId.trim().toUpperCase()
    const trimmedName = displayName.trim()
    if (!trimmedId || !trimmedName) {
      setError('Please enter both a Game ID and your name.')
      return
    }
    setJoining(true)
    setError('')
    try {
      const result = await joinGame(trimmedId, uid, trimmedName)
      if (result.success) {
        navigate(`/game/${trimmedId}`)
      } else {
        setError(result.error ?? 'Failed to join game.')
      }
    } catch (e) {
      setError('An error occurred. Please try again.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-fade-in">
        <button
          onClick={() => navigate('/')}
          className="text-[#8a7f6e] text-sm font-[Cinzel,serif] self-start"
        >
          ← Back
        </button>

        <div className="text-center">
          <h2 className="font-[Cinzel,serif] text-2xl text-[#e8e0d0] tracking-widest">
            Join Game
          </h2>
          <p className="text-[#8a7f6e] text-sm mt-1">Enter the Game ID from your host</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[#8a7f6e] text-xs font-[Cinzel,serif] uppercase tracking-widest mb-1">
              Game ID
            </label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value.toUpperCase())}
              placeholder="WOLF-XXXX"
              maxLength={9}
              className="w-full bg-[#1a1612] border border-[#3a3020] rounded px-4 py-3 text-[#e8e0d0] placeholder-[#5a5040] font-[Cinzel,serif] tracking-widest text-center text-xl outline-none focus:border-[#5a4a30]"
            />
          </div>

          <div>
            <label className="block text-[#8a7f6e] text-xs font-[Cinzel,serif] uppercase tracking-widest mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              className="w-full bg-[#1a1612] border border-[#3a3020] rounded px-4 py-3 text-[#e8e0d0] placeholder-[#5a5040] font-[Cinzel,serif] outline-none focus:border-[#5a4a30]"
            />
          </div>

          {error && (
            <p className="text-[#dc2626] text-sm font-[Cinzel,serif] text-center">
              {error}
            </p>
          )}

          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleJoin}
            disabled={joining || authLoading || !gameId.trim() || !displayName.trim()}
          >
            {joining ? 'Joining...' : 'Enter the Village'}
          </Button>
        </div>

        {/* Role Guide */}
        <div className="flex flex-col gap-3 pt-2">
          <p className="text-[#8a7f6e] text-xs font-[Cinzel,serif] uppercase tracking-widest text-center">
            Roles in this game
          </p>
          {ROLE_GUIDE.map((role) => (
            <div
              key={role.id}
              className="flex items-center gap-3 bg-[#1a1612] border border-[#3a3020] rounded-lg p-3"
            >
              <img
                src={getRoleImage(role.id)}
                alt={role.name}
                className="w-14 h-14 rounded-lg object-cover object-top flex-shrink-0"
              />
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-[Cinzel,serif] font-bold text-sm" style={{ color: role.color }}>
                    {role.name}
                  </span>
                  <span className="text-[#5a5040] text-xs font-[Cinzel,serif]">
                    {role.team}
                  </span>
                </div>
                <p className="text-[#8a7f6e] text-xs font-[Cinzel,serif] leading-relaxed">
                  {role.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
