import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { createGame, DEFAULT_SETTINGS } from '../services/gameService'
import type { GameSettings, GameMode, RoleId } from '../types/game'

const ROLE_LABELS: Record<RoleId, string> = {
  werewolf: '🐺 Werewolf',
  seer: '🔮 Seer',
  drunk_seer: '🍺 Drunk Seer',
  knight: '🛡️ Knight',
  villager: '👤 Villager',
}

export default function CreateGameScreen() {
  const navigate = useNavigate()
  const { uid, loading: authLoading } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [settings, setSettings] = useState<GameSettings>({ ...DEFAULT_SETTINGS })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const totalRoles = Object.values(settings.roleCounts).reduce((a, b) => a + b, 0)
  const isValid = totalRoles === settings.playerCount && displayName.trim().length > 0

  const handleCreate = async () => {
    if (!uid || !isValid) return
    setCreating(true)
    setError('')
    try {
      const gameId = await createGame(uid, displayName.trim(), settings)
      navigate(`/game/${gameId}`)
    } catch (e) {
      setError('Failed to create game. Please try again.')
      setCreating(false)
    }
  }

  const updateRoleCount = (role: RoleId, delta: number) => {
    setSettings((prev) => ({
      ...prev,
      roleCounts: {
        ...prev.roleCounts,
        [role]: Math.max(0, (prev.roleCounts[role] ?? 0) + delta),
      },
    }))
  }

  return (
    <Layout>
      <div className="flex flex-col gap-5 animate-fade-in pb-8">
        <button
          onClick={() => navigate('/')}
          className="text-[#8a7f6e] text-sm font-[Cinzel,serif] self-start"
        >
          ← Back
        </button>

        <div className="text-center">
          <h2 className="font-[Cinzel,serif] text-2xl text-[#e8e0d0] tracking-widest">
            Create Game
          </h2>
        </div>

        {/* Display name */}
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

        {/* Game Mode */}
        <div>
          <label className="block text-[#8a7f6e] text-xs font-[Cinzel,serif] uppercase tracking-widest mb-2">
            Game Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['live', 'busy'] as GameMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSettings((s) => ({ ...s, mode }))}
                className={`py-3 rounded border font-[Cinzel,serif] text-sm capitalize transition-colors ${
                  settings.mode === mode
                    ? 'bg-[#991b1b] border-[#dc2626] text-white'
                    : 'bg-[#1a1612] border-[#3a3020] text-[#8a7f6e] hover:border-[#5a4a30]'
                }`}
              >
                {mode === 'live' ? '⏱ Live' : '⏸ Busy'}
              </button>
            ))}
          </div>
          <p className="text-[#5a5040] text-xs mt-1 font-[Cinzel,serif]">
            {settings.mode === 'live'
              ? 'Timer-based phases. Auto-advances when time runs out.'
              : 'No timers. Phases advance when all actions are submitted.'}
          </p>
        </div>

        {/* Player Count */}
        <div>
          <label className="block text-[#8a7f6e] text-xs font-[Cinzel,serif] uppercase tracking-widest mb-2">
            Player Count
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                setSettings((s) => ({ ...s, playerCount: Math.max(4, s.playerCount - 1) }))
              }
              className="w-10 h-10 bg-[#1a1612] border border-[#3a3020] rounded text-[#e8e0d0] text-xl hover:border-[#5a4a30]"
            >
              −
            </button>
            <span className="text-[#e8e0d0] font-[Cinzel,serif] text-2xl font-bold w-8 text-center">
              {settings.playerCount}
            </span>
            <button
              onClick={() =>
                setSettings((s) => ({ ...s, playerCount: Math.min(20, s.playerCount + 1) }))
              }
              className="w-10 h-10 bg-[#1a1612] border border-[#3a3020] rounded text-[#e8e0d0] text-xl hover:border-[#5a4a30]"
            >
              +
            </button>
          </div>
        </div>

        {/* Role Counts */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[#8a7f6e] text-xs font-[Cinzel,serif] uppercase tracking-widest">
              Roles
            </label>
            <span
              className={`text-xs font-[Cinzel,serif] ${
                totalRoles === settings.playerCount
                  ? 'text-green-500'
                  : 'text-[#dc2626]'
              }`}
            >
              {totalRoles}/{settings.playerCount}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {(Object.keys(ROLE_LABELS) as RoleId[]).map((role) => (
              <div
                key={role}
                className="flex items-center justify-between bg-[#1a1612] border border-[#3a3020] rounded px-3 py-2"
              >
                <span className="text-[#e8e0d0] font-[Cinzel,serif] text-sm">
                  {ROLE_LABELS[role]}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateRoleCount(role, -1)}
                    className="w-7 h-7 bg-[#0f0d0a] border border-[#3a3020] rounded text-[#e8e0d0] hover:border-[#5a4a30]"
                  >
                    −
                  </button>
                  <span className="text-[#e8e0d0] w-4 text-center font-bold">
                    {settings.roleCounts[role] ?? 0}
                  </span>
                  <button
                    onClick={() => updateRoleCount(role, 1)}
                    className="w-7 h-7 bg-[#0f0d0a] border border-[#3a3020] rounded text-[#e8e0d0] hover:border-[#5a4a30]"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Mode Timers */}
        {settings.mode === 'live' && (
          <div>
            <label className="block text-[#8a7f6e] text-xs font-[Cinzel,serif] uppercase tracking-widest mb-2">
              Timers (seconds)
            </label>
            <div className="flex flex-col gap-2">
              {[
                { key: 'nightDuration' as const, label: 'Night' },
                { key: 'discussionDuration' as const, label: 'Discussion' },
                { key: 'votingDuration' as const, label: 'Voting' },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between bg-[#1a1612] border border-[#3a3020] rounded px-3 py-2"
                >
                  <span className="text-[#e8e0d0] text-sm font-[Cinzel,serif]">{label}</span>
                  <input
                    type="number"
                    value={settings[key]}
                    min={30}
                    max={600}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, [key]: Number(e.target.value) }))
                    }
                    className="w-20 bg-[#0f0d0a] border border-[#3a3020] rounded px-2 py-1 text-[#e8e0d0] text-sm text-center font-[Cinzel,serif] outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Knight Settings */}
        <div>
          <label className="block text-[#8a7f6e] text-xs font-[Cinzel,serif] uppercase tracking-widest mb-2">
            Knight Rules
          </label>
          <div className="flex flex-col gap-2">
            {[
              { key: 'knightConsecutiveProtect' as const, label: 'Allow consecutive same-player protection' },
              { key: 'knightSelfProtect' as const, label: 'Allow self-protection' },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center justify-between bg-[#1a1612] border border-[#3a3020] rounded px-3 py-2 cursor-pointer"
              >
                <span className="text-[#e8e0d0] text-sm font-[Cinzel,serif]">{label}</span>
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, [key]: e.target.checked }))
                  }
                  className="w-5 h-5 accent-[#991b1b]"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Drunk Seer Accuracy */}
        {settings.roleCounts.drunk_seer > 0 && (
          <div>
            <label className="block text-[#8a7f6e] text-xs font-[Cinzel,serif] uppercase tracking-widest mb-2">
              Drunk Seer Accuracy: {settings.drunkSeerAccuracy}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.drunkSeerAccuracy}
              onChange={(e) =>
                setSettings((s) => ({ ...s, drunkSeerAccuracy: Number(e.target.value) }))
              }
              className="w-full accent-[#7c3aed]"
            />
          </div>
        )}

        {/* Misc */}
        <label className="flex items-center justify-between bg-[#1a1612] border border-[#3a3020] rounded px-3 py-2 cursor-pointer">
          <span className="text-[#e8e0d0] text-sm font-[Cinzel,serif]">Reveal roles to dead players</span>
          <input
            type="checkbox"
            checked={settings.revealRolesToDead}
            onChange={(e) =>
              setSettings((s) => ({ ...s, revealRolesToDead: e.target.checked }))
            }
            className="w-5 h-5 accent-[#991b1b]"
          />
        </label>

        {error && (
          <p className="text-[#dc2626] text-sm font-[Cinzel,serif] text-center">{error}</p>
        )}

        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={handleCreate}
          disabled={creating || authLoading || !isValid}
        >
          {creating ? 'Creating...' : 'Create Game'}
        </Button>

        {totalRoles !== settings.playerCount && (
          <p className="text-[#dc2626] text-xs text-center font-[Cinzel,serif]">
            Role count ({totalRoles}) must equal player count ({settings.playerCount})
          </p>
        )}
      </div>
    </Layout>
  )
}
