// Skill Normalization Layer (Phase 3).
// Converts free-form skill mentions from any source (student profiles, future
// ESCO/O*NET ingestion, employer feedback) into canonical skill IDs.
// UI-independent: reusable by industry ingestion, profile parsing, role
// matching, employer validation and curriculum analysis.

import { SKILL_TAXONOMY } from '../data/intelligence/skills'

function normalizeKey(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9+#]/g, '')
}

// Alias index is built once from the centralized taxonomy — never duplicated.
const aliasIndex = new Map()
for (const skill of SKILL_TAXONOMY) {
  aliasIndex.set(normalizeKey(skill.id), skill)
  aliasIndex.set(normalizeKey(skill.name), skill)
  for (const alias of skill.aliases ?? []) {
    const key = normalizeKey(alias)
    if (key && !aliasIndex.has(key)) aliasIndex.set(key, skill)
  }
}

/** Raw input → normalized lookup key (e.g. "React.js" → "reactjs"). */
export function normalizeSkillName(input) {
  return normalizeKey(input)
}

/** Input string → canonical skill object, or null if unknown. */
export function findSkillByAlias(input) {
  const key = normalizeKey(input)
  if (!key) return null
  return aliasIndex.get(key) ?? null
}

/** Input string → canonical skill object (id, name or alias match), or null. */
export function getCanonicalSkill(input) {
  if (!input) return null
  if (typeof input === 'object' && input.id) {
    return SKILL_TAXONOMY.find((s) => s.id === input.id) ?? null
  }
  return findSkillByAlias(input)
}

/** Input string → canonical skill id (e.g. "ReactJS" → "react"), or null. */
export function normalizeSkill(input) {
  return getCanonicalSkill(input)?.id ?? null
}

/**
 * Backward-compatibility hook for the Phase 2 Student Profile, which stores
 * skills as display strings ({ name, proficiency }).
 * Returns { skillId, skill } or null when the name is outside the taxonomy.
 * The student's visible profile data is left untouched.
 */
export function resolveStudentSkill(studentSkillName) {
  const skill = getCanonicalSkill(studentSkillName)
  if (!skill) return null
  return { skillId: skill.id, skill }
}
