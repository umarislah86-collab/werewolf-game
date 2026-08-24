import type { RoleDefinition } from './types'

export const seerRole: RoleDefinition = {
  id: 'seer',
  name: 'seer',
  displayName: 'Seer',
  description:
    'You are the Seer. Each night, you may investigate one player to learn their true alignment — Werewolf or not a Werewolf. Only you see the result.',
  team: 'village',
  hasNightAction: true,
  actionType: 'investigate',
  resolutionPriority: 10,
  canTargetSelf: false,
  canTargetDead: false,
  showTrueRoleAs: 'seer',
  icon: '🔮',
  color: '#7c3aed',
}
