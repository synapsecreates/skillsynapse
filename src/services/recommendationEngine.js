// Recommendation Engine (Phase 6).
// Deterministic, explainable, local-only: no LLM, no external APIs, no
// randomness. Consumes Phase 5 gap analysis output — it never re-derives
// gaps, never recalculates role matching, and never hardcodes skill names.
//
// Decision logic (per gap status):
//   missing → "learn"      ("Learn {Name} Foundations")
//   partial with gapSeverity >= DEVELOP_THRESHOLD (0.4) → "develop"
//                          ("Develop Core {Name} Competency")
//   partial with smaller severity → "strengthen"
//                          ("Strengthen {Name} Through Practice")
//   optional (missing complementary) → "advance" ("Explore {Name} Further"),
//                          always listed separately, never competing with urgent gaps
//   strength → no recommendation
//
// Ordering inherits Phase 5 priorityScore (importance × category weight ×
// severity). Explanations are deterministic templates filled with actual
// role/level/priority data.

import { REQUIREMENT_LEVEL_LABELS } from './industryIntelligence'

export const RECOMMENDATION_TYPES = {
  learn: { action: 'Learn Foundations', verb: 'Learn' },
  develop: { action: 'Build Core Competency', verb: 'Develop' },
  strengthen: { action: 'Strengthen Through Practice', verb: 'Strengthen' },
  advance: { action: 'Advance Further', verb: 'Explore' },
}

/** Partial gaps at or above this severity need developing; below it, practice. */
export const DEVELOP_SEVERITY_THRESHOLD = 0.4

function levelName(level) {
  return level > 0 ? REQUIREMENT_LEVEL_LABELS[level] : 'Not Yet Added'
}

function decideType(gap) {
  if (gap.status === 'missing') return 'learn'
  if (gap.status === 'optional') return 'advance'
  if (gap.status === 'partial') {
    return gap.gapSeverity >= DEVELOP_SEVERITY_THRESHOLD ? 'develop' : 'strengthen'
  }
  return null
}

function buildTitle(type, skillName) {
  switch (type) {
    case 'learn':
      return `Learn ${skillName} Foundations`
    case 'develop':
      return `Develop Core ${skillName} Competency`
    case 'strengthen':
      return `Strengthen ${skillName} Through Practice`
    case 'advance':
      return `Explore ${skillName} Further`
    default:
      return skillName
  }
}

function buildExplanation(type, gap, roleName) {
  const target = levelName(gap.requiredLevel)
  switch (type) {
    case 'learn':
      return `${gap.skillName} is a ${gap.requirementCategory} skill for the ${roleName} role and is not currently present in your profile. Learning its foundations is a ${gap.priorityLabel.toLowerCase()} step toward the expected ${target} level.`
    case 'develop':
      return `Your ${gap.skillName} proficiency (${levelName(gap.studentLevel)}) is significantly below the ${target} level expected for the ${roleName} role, making it a ${gap.priorityLabel.toLowerCase()} area for improvement.`
    case 'strengthen':
      return `You already have foundational ${gap.skillName} knowledge (${levelName(gap.studentLevel)}). Focused practice will close the remaining gap to the expected ${target} level for the ${roleName} role.`
    case 'advance':
      return `${gap.skillName} is a complementary skill for the ${roleName} role — an additional advantage once core requirements are covered, not an urgent priority.`
    default:
      return ''
  }
}

/**
 * Convert a Phase 5 gap analysis result into structured recommendations.
 * Returns { role, summary, recommendations, primaryFocus,
 * additionalAreas, optionalAdvancements }.
 */
export function generateRecommendations(gapAnalysis) {
  const role = gapAnalysis?.role ?? null
  const roleName = role?.name ?? 'the selected role'
  const gaps = [
    ...(gapAnalysis?.partialGaps ?? []),
    ...(gapAnalysis?.missingSkills ?? []),
    ...(gapAnalysis?.optionalSkills ?? []),
  ]

  const recommendations = []
  for (const gap of gaps) {
    const type = decideType(gap)
    if (!type) continue
    recommendations.push({
      skillId: gap.skillId,
      skillName: gap.skillName,
      skillCategory: gap.skillCategory,
      recommendationType: type,
      action: RECOMMENDATION_TYPES[type].action,
      priorityScore: gap.priorityScore,
      priorityLabel: gap.priorityLabel,
      requirementCategory: gap.requirementCategory,
      importance: gap.importance,
      studentLevel: gap.studentLevel,
      studentLevelLabel: levelName(gap.studentLevel),
      requiredLevel: gap.requiredLevel,
      requiredLevelLabel: levelName(gap.requiredLevel),
      gapLevels: gap.gapLevels,
      gapSeverity: gap.gapSeverity,
      title: buildTitle(type, gap.skillName),
      explanation: buildExplanation(type, gap, roleName),
    })
  }

  recommendations.sort((a, b) => b.priorityScore - a.priorityScore)

  const urgent = recommendations.filter((r) => r.recommendationType !== 'advance')
  const optionalAdvancements = recommendations.filter((r) => r.recommendationType === 'advance')
  const primaryFocus = urgent.slice(0, 3)
  const additionalAreas = urgent.slice(3)

  const countByType = (type) => urgent.filter((r) => r.recommendationType === type).length

  return {
    role,
    summary: {
      totalRecommendations: urgent.length,
      learnCount: countByType('learn'),
      developCount: countByType('develop'),
      strengthenCount: countByType('strengthen'),
      optionalCount: optionalAdvancements.length,
      highestPriorityCount: urgent.filter((r) => r.priorityLabel === 'Highest Priority').length,
    },
    recommendations,
    primaryFocus,
    additionalAreas,
    optionalAdvancements,
  }
}
