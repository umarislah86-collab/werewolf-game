import type { RoleDefinition } from './types'

export const villagerRole: RoleDefinition = {
  id: 'villager',
  name: 'villager',
  displayName: 'Villager',
  description:
    'You are a Villager. You have no special night powers, but your vote and deduction matter greatly. Find the werewolves and eliminate them before they outnumber you.',
  team: 'village',
  hasNightAction: false,
  actionType: null,
  resolutionPriority: 99,
  canTargetSelf: false,
  canTargetDead: false,
  showTrueRoleAs: 'villager',
  icon: '👤',
  color: '#6b7280',
}
