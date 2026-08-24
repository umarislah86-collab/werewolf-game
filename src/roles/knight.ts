import type { RoleDefinition } from './types'

export const knightRole: RoleDefinition = {
  id: 'knight',
  name: 'knight',
  displayName: 'Knight',
  description:
    'You are the Knight. Each night, choose one player to protect. If the werewolves target your protected player, they survive. You receive no confirmation of whether your protection was needed.',
  team: 'village',
  hasNightAction: true,
  actionType: 'protect',
  resolutionPriority: 20,
  canTargetSelf: false, // controlled by setting
  canTargetDead: false,
  showTrueRoleAs: 'knight',
  settings: [
    {
      key: 'knightConsecutiveProtect',
      label: 'Allow protecting same player consecutively',
      type: 'boolean',
      default: false,
    },
    {
      key: 'knightSelfProtect',
      label: 'Allow protecting self',
      type: 'boolean',
      default: false,
    },
  ],
  icon: '🛡️',
  color: '#d97706',
}
