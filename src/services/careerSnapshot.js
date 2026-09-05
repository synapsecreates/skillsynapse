// Career Readiness Snapshot Builder (Phase 7).
// Consolidates Phase 4 (matching), Phase 5 (gaps) and Phase 6
// (recommendations) into ONE structured snapshot that the report UI
// consumes directly. No algorithm is duplicated here: matching, gap and
// recommendation logic are reused as-is.
//
// Role Match vs Career Readiness (kept deliberately distinct):
//   readiness = round(Σ importance × min(student/required, 1) / Σ importance × 100)
//     → weighted share of the target role's requirements currently fulfilled.
//   matchScore (Phase 4) = readiness-like raw score × criticalPenalty
//     → the same fulfillment, additionally discounted when critical skills
//       are missing so cross-role ranking stays fair.
// Both are deterministic integers; the report explains the difference.
//
// Readiness bands: 80+ Role Ready · 60+ Progressing · 40+ Developing · else
// Early Stage.
//
// Narrative seam (Part 9): generateAssessmentNarrative() is the deterministic
// template provider. A future optional AI narrative layer can replace or
// augment exactly this function; everything else stays untouched and the
// app remains fully functional without AI.

import { getRoleById, REQUIREMENT_LEVEL_LABELS } from './industryIntelligence'
import { matchAllRoles } from './roleMatching'
import { analyzeSkillGaps } from './skillGapAnalysis'
import { generateRecommendations } from './recommendationEngine'

export const READINESS_BANDS = [
  { min: 80, label: 'Role Ready' },
  { min: 60, label: 'Progressing' },
  { min: 40, label: 'Developing' },
  { min: 0, label: 'Early Stage' },
]

export function getReadinessBand(score) {
  return READINESS_BANDS.find((b) => score >= b.min)?.label ?? 'Early Stage'
}

function levelName(level) {
  return level > 0 ? REQUIREMENT_LEVEL_LABELS[level] : 'Not Yet Added'
}

/**
 * Deterministic template narrative built only from snapshot metrics.
 * Replaceable by a future AI narrative provider (see module header).
 */
export function generateAssessmentNarrative(snapshot) {
  const { targetRole, roleMatch, readiness, strengths, criticalAreas } = snapshot
  const strengthNames = strengths.slice(0, 3).map((s) => s.skillName)
  const gapNames = criticalAreas.slice(0, 3).map((g) => g.skillName)

  const alignment =
    roleMatch.category === 'Strong Match' || roleMatch.category === 'Good Match'
      ? `solid ${roleMatch.category.toLowerCase()}`
      : `a ${roleMatch.category.toLowerCase()}`

  const strengthPart =
    strengthNames.length > 0
      ? `, supported by strengths in ${strengthNames.join(', ')}`
      : ', with foundational skills still to establish'

  const gapPart =
    gapNames.length > 0
      ? ` Your primary development focus should be ${gapNames.join(', ')}. Closing these gaps would significantly improve your readiness for the ${targetRole.name} role.`
      : ` You already meet the mapped requirements — focus on keeping these skills sharp.`

  return (
    `You currently show ${alignment} with the ${targetRole.domain} area` +
    `${strengthPart}. Overall readiness for ${targetRole.name} is ${readiness.score}% (${readiness.band}).` +
    `${gapPart}`
  )
}

/**
 * Build the career snapshot from canonical student skills.
 * Returns null when there is nothing to analyze (caller shows empty state).
 */
export function buildCareerSnapshot(canonicalSkills, targetRoleId, studentName = '') {
  if (!Array.isArray(canonicalSkills) || canonicalSkills.length === 0) return null

  const matches = matchAllRoles(canonicalSkills)
  if (matches.length === 0) return null

  const targetMatch =
    matches.find((m) => m.role.id === targetRoleId) ?? matches[0]
  const roleObj = getRoleById(targetMatch.role.id)
  if (!roleObj) return null

  const gaps = analyzeSkillGaps(canonicalSkills, roleObj)
  const recs = generateRecommendations(gaps)

  // Readiness: weighted requirement fulfillment (no critical penalty —
  // that discount lives in the match score used for ranking).
  let totalImportance = 0
  let fulfilled = 0
  const studentById = new Map()
  for (const s of canonicalSkills) {
    if (!s?.canonicalSkillId) continue
    const level = Math.min(5, Math.max(1, Math.round(Number(s.level) || 1)))
    const prev = studentById.get(s.canonicalSkillId)
    if (!prev || level > prev) studentById.set(s.canonicalSkillId, level)
  }
  for (const req of roleObj.skills ?? []) {
    totalImportance += req.importance
    const studentLevel = studentById.get(req.skillId) ?? 0
    const fit = req.requiredLevel > 0 ? Math.min(studentLevel / req.requiredLevel, 1) : 1
    fulfilled += req.importance * fit
  }
  const readinessScore = totalImportance > 0 ? Math.round((fulfilled / totalImportance) * 100) : 0

  const strengths = [...gaps.strengths].sort((a, b) => b.importance - a.importance).slice(0, 5)
  const criticalAreas = gaps.prioritizedGaps.slice(0, 4)
  const rank = matches.findIndex((m) => m.role.id === targetMatch.role.id) + 1

  const snapshot = {
    studentName: typeof studentName === 'string' ? studentName.trim() : '',
    generatedFrom: 'local deterministic intelligence',
    targetRole: targetMatch.role,
    analyzedSkillsCount: canonicalSkills.length,
    roleMatch: {
      score: targetMatch.matchScore,
      category: targetMatch.matchCategory,
      rank,
      totalRoles: matches.length,
      strongestRole: { ...matches[0].role, score: matches[0].matchScore },
    },
    readiness: {
      score: readinessScore,
      band: getReadinessBand(readinessScore),
    },
    strengths,
    criticalAreas,
    primaryPlan: recs.primaryFocus,
    additionalCount: recs.additionalAreas.length,
    optionalCount: recs.optionalAdvancements.length,
    counts: {
      totalRequired: gaps.summary.totalRequiredSkills,
      strengths: gaps.summary.strengthsCount,
      partial: gaps.summary.partialGapsCount,
      missing: gaps.summary.missingSkillsCount,
      criticalGaps: gaps.summary.criticalGapsCount,
    },
    assessment: '',
  }
  snapshot.assessment = generateAssessmentNarrative(snapshot)
  return snapshot
}

export { levelName as snapshotLevelName }
