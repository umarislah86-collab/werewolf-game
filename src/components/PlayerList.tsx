import type { Player } from '../types/game'

interface PlayerListProps {
  players: Player[]
  selectedUid?: string | null
  onSelect?: (uid: string) => void
  disabledUids?: string[]
  showDeadState?: boolean
  labelMap?: Record<string, string>
}

export default function PlayerList({
  players,
  selectedUid,
  onSelect,
  disabledUids = [],
  showDeadState = true,
  labelMap = {},
}: PlayerListProps) {
  return (
    <div className="flex flex-col gap-2">
      {players.map((player) => {
        const isDead = showDeadState && !player.isAlive
        const isDisabled = disabledUids.includes(player.uid) || isDead
        const isSelected = selectedUid === player.uid
        const label = labelMap[player.uid]

        return (
          <button
            key={player.uid}
            onClick={() => !isDisabled && onSelect?.(player.uid)}
            disabled={isDisabled}
            className={`
              flex items-center justify-between w-full px-4 py-3 rounded
              border font-[Cinzel,serif] text-left transition-all duration-150
              min-h-[52px]
              ${
                isSelected
                  ? 'bg-[#991b1b] border-[#dc2626] text-white'
                  : isDead
                  ? 'bg-[#0f0d0a] border-[#2a2010] text-[#5a5040] line-through'
                  : isDisabled
                  ? 'bg-[#1a1612] border-[#2a2010] text-[#5a5040] cursor-not-allowed'
                  : 'bg-[#1a1612] border-[#3a3020] text-[#e8e0d0] hover:border-[#5a4a30] hover:bg-[#221e18] cursor-pointer'
              }
            `}
          >
            <span className="flex items-center gap-2">
              {isDead && <span className="text-[#5a5040]">✝</span>}
              {player.displayName}
              {player.isCreator && (
                <span className="text-[#d97706] text-xs">Crown</span>
              )}
            </span>
            {label && (
              <span className="text-xs text-[#8a7f6e]">{label}</span>
            )}
            {isSelected && <span className="text-white text-sm">✓</span>}
          </button>
        )
      })}
    </div>
  )
}
