import type { RoleDefinition } from './types'

export const drunkSeerRole: RoleDefinition = {
  id: 'drunk_seer',
  name: 'drunk_seer',
  displayName: 'Seer', // intentionally shows as Seer
  description:
    'You are the Seer. Each night, you may investigate one player to learn their alignment. Only you see the result.',
  team: 'village',
  hasNightAction: true,
  actionType: 'investigate',
  resolutionPriority: 10,
  canTargetSelf: false,
  canTargetDead: false,
  showTrueRoleAs: 'seer', // ALWAYS display as seer
  settings: [
    {
      key: 'drunkSeerAccuracy',
      label: 'Drunk Seer Accuracy (%)',
      type: 'number',
      default: 50,
      min: 0,
      max: 100,
    },
  ],
  icon: '🔮',
  color: '#7c3aed',
}
