import type { GamePhase } from '../types/game'

interface PhaseHeaderProps {
  phase: GamePhase
  night?: number
  subtitle?: string
}

const phaseLabels: Record<GamePhase, string> = {
  lobby: 'Gathering',
  role_reveal: 'Role Reveal',
  night: 'Night',
  night_resolution: 'Night',
  morning: 'Morning',
  discussion: 'Discussion',
  voting: 'Trial',
  vote_result: 'Verdict',
  game_over: 'Game Over',
}

const phaseColors: Record<GamePhase, string> = {
  lobby: 'text-[#d97706]',
  role_reveal: 'text-[#7c3aed]',
  night: 'text-[#6d28d9]',
  night_resolution: 'text-[#6d28d9]',
  morning: 'text-[#d97706]',
  discussion: 'text-[#e8e0d0]',
  voting: 'text-[#dc2626]',
  vote_result: 'text-[#dc2626]',
  game_over: 'text-[#d97706]',
}

export default function PhaseHeader({ phase, night, subtitle }: PhaseHeaderProps) {
  const label = phaseLabels[phase]
  const color = phaseColors[phase]

  return (
    <div className="text-center mb-6">
      <div className="flex items-center justify-center gap-2">
        <div className="h-px flex-1 bg-[#3a3020]" />
        <h1
          className={`font-[Cinzel,serif] text-2xl font-bold tracking-widest uppercase ${color}`}
        >
          {label}
          {night !== undefined && night > 0 ? ` ${night}` : ''}
        </h1>
        <div className="h-px flex-1 bg-[#3a3020]" />
      </div>
      {subtitle && (
        <p className="text-[#8a7f6e] text-sm mt-1 font-[Cinzel,serif]">{subtitle}</p>
      )}
    </div>
  )
}
