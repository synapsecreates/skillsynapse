// Central Skill Catalog (Phase 5.5).
// Single source of truth for every skill a student can select.
// Derived programmatically — never hand-duplicated:
//   1. every unique skillId required by any role (guarantees
//      roleRequiredSkills ⊆ studentSelectableSkills by construction), plus
//   2. every remaining taxonomy skill (so previously selectable skills such
//      as Java or C never disappear from the profile).
// Students store display names as before; the Phase 4 adapter resolves them
// to canonical ids, so stored data and proficiency handling are unchanged.

import { ROLES } from './roles'
import { SKILL_TAXONOMY } from './skills'

function buildSelectableCatalog() {
  const requiredIds = new Set()
  for (const role of ROLES) {
    for (const req of role.skills ?? []) requiredIds.add(req.skillId)
  }

  const byId = new Map(SKILL_TAXONOMY.map((s) => [s.id, s]))
  const ordered = [
    ...[...requiredIds].filter((id) => byId.has(id)),
    ...[...byId.keys()].filter((id) => !requiredIds.has(id)),
  ]

  const groups = new Map()
  for (const id of ordered) {
    const skill = byId.get(id)
    if (!groups.has(skill.category)) groups.set(skill.category, [])
    groups.get(skill.category).push({ id: skill.id, name: skill.name })
  }

  return [...groups.entries()].map(([category, skills]) => ({ category, skills }))
}

export const SELECTABLE_SKILL_CATALOG = buildSelectableCatalog()

export const SELECTABLE_SKILL_IDS = new Set(
  SELECTABLE_SKILL_CATALOG.flatMap((g) => g.skills.map((s) => s.id)),
)

/** Every skill id required by any role — the consistency-check baseline. */
export function getRoleRequiredSkillIds() {
  const ids = new Set()
  for (const role of ROLES) {
    for (const req of role.skills ?? []) ids.add(req.skillId)
  }
  return ids
}
