import type { RoleId, Team } from '../types/game'

export interface RoleSettingDefinition {
  key: string
  label: string
  type: 'boolean' | 'number'
  default: boolean | number
  min?: number
  max?: number
}

export interface RoleDefinition {
  id: RoleId
  name: string
  displayName: string
  description: string
  team: Team
  hasNightAction: boolean
  actionType: 'kill' | 'investigate' | 'protect' | null
  resolutionPriority: number // 10=info, 20=protection, 40=killing
  canTargetSelf: boolean
  canTargetDead: boolean
  showTrueRoleAs: RoleId // drunk_seer shows as 'seer'
  settings?: RoleSettingDefinition[]
  icon: string
  color: string
}
