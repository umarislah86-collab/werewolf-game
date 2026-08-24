import type { RoleDefinition } from './types'
import { werewolfRole } from './werewolf'
import { seerRole } from './seer'
import { drunkSeerRole } from './drunkSeer'
import { knightRole } from './knight'
import { villagerRole } from './villager'
import type { RoleId } from '../types/game'

export const ROLE_REGISTRY: Record<RoleId, RoleDefinition> = {
  werewolf: werewolfRole,
  seer: seerRole,
  drunk_seer: drunkSeerRole,
  knight: knightRole,
  villager: villagerRole,
}

export function getRoleDefinition(roleId: RoleId): RoleDefinition {
  return ROLE_REGISTRY[roleId]
}

// Get display role — drunk_seer shows as seer, all others return themselves
export function getDisplayRole(roleId: RoleId): RoleDefinition {
  const def = ROLE_REGISTRY[roleId]
  if (def.showTrueRoleAs) return ROLE_REGISTRY[def.showTrueRoleAs as RoleId] ?? def
  return def
}
