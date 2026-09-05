// Industry Intelligence Processing Layer (Phase 3, provenance-hardened 8.5A).
// Role Selected → source metadata → role-skill requirements → normalization →
// classification by requirement category → unified role intelligence object.
// UI components consume `getRoleIntelligence()`; no processing logic lives in
// pages. Local data only — no external APIs, no API keys. Requirement
// `mappingWeight` values are curated authoring parameters (see
// data/intelligence/methodology.js); only coarse coverage bands reach the UI.

import { ROLES } from '../data/intelligence/roles'
import { SKILL_TAXONOMY } from '../data/intelligence/skills'
import { getRoleSourceCards } from '../data/intelligence/sourceMappings'
import { INTELLIGENCE_METHODOLOGY, coverageBandFor } from '../data/intelligence/methodology'
import { getCanonicalSkill } from '../utils/skillNormalization'

export const REQUIREMENT_LEVEL_LABELS = {
  1: 'Awareness',
  2: 'Beginner',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
}

export const REQUIREMENT_CATEGORY_ORDER = ['critical', 'core', 'supporting', 'complementary']

export function getAllRoles() {
  return ROLES
}

export function getRoleById(roleId) {
  return ROLES.find((r) => r.id === roleId) ?? null
}

/**
 * Build the unified intelligence object for a role.
 * Returns { role, sources, skills, summary } or null for unknown role ids.
 */
export function getRoleIntelligence(roleId) {
  const role = getRoleById(roleId)
  if (!role) return null

  // Normalize every skill reference against the canonical taxonomy.
  const skills = role.skills
    .map((requirement) => {
      const skill = getCanonicalSkill(requirement.skillId)
      if (!skill) return null
      return { ...requirement, skill }
    })
    .filter(Boolean)
    .sort((a, b) => b.importance - a.importance)

  const groups = { critical: [], core: [], supporting: [], complementary: [] }
  for (const item of skills) {
    if (groups[item.requirementCategory]) groups[item.requirementCategory].push(item)
  }

  // Mean of curated mapping weights — an internal descriptive average, NOT a
  // measured statistical confidence. Only the coarse coverage band is surfaced.
  const mappingWeightAvg =
    skills.length === 0
      ? 0
      : Math.round(
          (skills.reduce((sum, s) => sum + (s.mappingWeight ?? 0), 0) / skills.length) * 100,
        ) / 100

  return {
    role: {
      id: role.id,
      name: role.name,
      domain: role.domain,
      description: role.description,
      primaryFocus: role.primaryFocus,
      provenance: role.provenance ?? null,
    },
    sources: getRoleSourceCards(role),
    skills,
    methodology: INTELLIGENCE_METHODOLOGY,
    summary: {
      criticalSkills: groups.critical,
      coreSkills: groups.core,
      supportingSkills: groups.supporting,
      complementarySkills: groups.complementary,
      counts: {
        critical: groups.critical.length,
        core: groups.core.length,
        supporting: groups.supporting.length,
        complementary: groups.complementary.length,
        total: skills.length,
      },
      coverage: coverageBandFor(mappingWeightAvg),
      mappingWeightAvg,
      primaryFocus: role.primaryFocus,
      topSkills: skills.slice(0, 3),
    },
  }
}

/** All canonical skills, for taxonomy browsers or future matching engines. */
export function getSkillTaxonomy() {
  return SKILL_TAXONOMY
}
