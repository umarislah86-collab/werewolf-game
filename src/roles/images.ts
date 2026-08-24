import type { RoleId } from '../types/game'

const BASE = import.meta.env.BASE_URL

const ROLE_IMAGES: Record<RoleId, string> = {
  werewolf: `${BASE}roles/werewolf.png`,
  seer: `${BASE}roles/seer.png`,
  drunk_seer: `${BASE}roles/drunk_seer.png`,
  knight: `${BASE}roles/knight.jpg`,
  villager: `${BASE}roles/villager.png`,
}

export function getRoleImage(role: RoleId): string {
  return ROLE_IMAGES[role]
}
