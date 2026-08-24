import type { RoleDefinition } from './types'

export const werewolfRole: RoleDefinition = {
  id: 'werewolf',
  name: 'werewolf',
  displayName: 'Werewolf',
  description:
    'You are a Werewolf. Each night, pick a villager to eliminate. If all werewolves agree on the same target, that player is killed. If there is ANY disagreement, one random werewolf dies instead.',
  team: 'werewolf',
  hasNightAction: true,
  actionType: 'kill',
  resolutionPriority: 40,
  canTargetSelf: false,
  canTargetDead: false,
  showTrueRoleAs: 'werewolf',
  icon: '🐺',
  color: '#991b1b',
}
