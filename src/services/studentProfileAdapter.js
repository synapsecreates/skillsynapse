// Student Profile Adapter (Phase 4).
// Converts the Phase 2 profile shape — skills as
// { name: display string, proficiency: 0–100 } — into canonical matching
// input: [{ canonicalSkillId, level (1–5) }].
// Reuses the Phase 3 normalization utilities, handles aliases, textual
// levels (defensive: legacy/test data), drops unknowns safely, dedupes by
// canonical id keeping the highest level. Pure logic — no UI, no storage.

import { getCanonicalSkill } from '../utils/skillNormalization'

export const TEXTUAL_LEVEL_TO_NUMERIC = {
  awareness: 1,
  beginner: 2,
  basic: 2,
  intermediate: 3,
  advanced: 4,
  expert: 5,
}

/**
 * Proficiency (0–100 numeric, or textual label) → canonical level 1–5.
 * Quintile rule for numerics: 0–20 → 1, 21–40 → 2, 41–60 → 3, 61–80 → 4,
 * 81–100 → 5. A zero proficiency means no working knowledge (Awareness).
 */
export function proficiencyToLevel(proficiency) {
  if (typeof proficiency === 'string') {
    const mapped = TEXTUAL_LEVEL_TO_NUMERIC[proficiency.trim().toLowerCase()]
    if (mapped) return mapped
    const asNumber = Number(proficiency)
    if (!Number.isNaN(asNumber)) return proficiencyToLevel(asNumber)
    return 1
  }
  const value = Number(proficiency)
  if (Number.isNaN(value)) return 1
  const clamped = Math.min(100, Math.max(0, Math.round(value)))
  if (clamped <= 20) return 1
  if (clamped <= 40) return 2
  if (clamped <= 60) return 3
  if (clamped <= 80) return 4
  return 5
}

/**
 * Adapt a student profile object (as returned by loadProfile()) into
 * canonical matching input.
 * Returns { skills: [{ canonicalSkillId, level, sourceName }], skipped: [names] }.
 */
export function adaptStudentProfile(profile) {
  const rawSkills = Array.isArray(profile?.skills) ? profile.skills : []
  const byId = new Map()
  const skipped = []

  for (const entry of rawSkills) {
    const name = typeof entry?.name === 'string' ? entry.name.trim() : ''
    if (!name) continue
    const canonical = getCanonicalSkill(name)
    if (!canonical) {
      skipped.push(name)
      continue
    }
    const level = proficiencyToLevel(entry?.proficiency ?? entry?.level)
    const existing = byId.get(canonical.id)
    // Same canonical skill from multiple entries (e.g. "ReactJS" +
    // "React.js"): keep the highest known level.
    if (!existing || level > existing.level) {
      byId.set(canonical.id, { canonicalSkillId: canonical.id, level, sourceName: canonical.name })
    }
  }

  return { skills: [...byId.values()], skipped }
}
