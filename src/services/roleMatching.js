// Role Matching Engine (Phase 4).
// Deterministic, explainable, local-only: no LLM, no external APIs.
// Compares canonical student skills [{ canonicalSkillId, level 1–5 }] against
// Phase 3 role requirements [{ skillId, importance, requiredLevel,
// requirementCategory }] and produces structured per-role results.
// The UI consumes these objects directly — no recalculation in components.
//
// Scoring:
//   contribution(skill) = importance × min(studentLevel / requiredLevel, 1)
//                         × availability(1 has skill, 0 missing)
//   rawScore = Σ contributions / Σ importance × 100
//   finalScore = rawScore × criticalPenalty, rounded to whole 0–100.
//
// Critical penalty: penalty = 0.75 + 0.25 × (criticalMatched / criticalTotal),
// i.e. a role with all critical skills missing keeps 75% of its raw score,
// scaling linearly to 100% when all criticals are present. Never negative,
// fully explainable from the result's criticalSkillsMissing list.

import { ROLES } from '../data/intelligence/roles'
import { getCanonicalSkill } from '../utils/skillNormalization'

export const MATCH_CATEGORIES = [
  { min: 80, label: 'Strong Match' },
  { min: 60, label: 'Good Match' },
  { min: 40, label: 'Developing Match' },
  { min: 0, label: 'Low Current Match' },
]

export function getMatchCategory(score) {
  return MATCH_CATEGORIES.find((c) => score >= c.min)?.label ?? 'Low Current Match'
}

function proficiencyFit(studentLevel, requiredLevel) {
  if (!requiredLevel || requiredLevel <= 0) return 1
  return Math.min(studentLevel / requiredLevel, 1)
}

function toStudentMap(canonicalSkills) {
  const map = new Map()
  for (const s of canonicalSkills ?? []) {
    if (!s?.canonicalSkillId) continue
    const level = Math.min(5, Math.max(1, Math.round(Number(s.level) || 1)))
    const existing = map.get(s.canonicalSkillId)
    if (!existing || level > existing) map.set(s.canonicalSkillId, level)
  }
  return map
}

function enrich(skillId, requirement) {
  const skill = getCanonicalSkill(skillId)
  return {
    skillId,
    name: skill?.name ?? skillId,
    category: skill?.category ?? 'General',
    importance: requirement.importance,
    requiredLevel: requirement.requiredLevel,
    requirementCategory: requirement.requirementCategory,
  }
}

/**
 * Match canonical student skills against a single role object.
 * Returns a structured result; UI-ready, no further computation needed.
 */
export function matchRole(canonicalSkills, role) {
  const student = toStudentMap(canonicalSkills)
  const requirements = Array.isArray(role?.skills) ? role.skills : []

  const matchedSkills = []
  const partialMatches = []
  const missingSkills = []
  let totalImportance = 0
  let contributionSum = 0

  for (const req of requirements) {
    const item = enrich(req.skillId, req)
    totalImportance += req.importance
    const studentLevel = student.get(req.skillId)
    if (studentLevel == null) {
      missingSkills.push({ ...item, studentLevel: 0, proficiencyFit: 0, contribution: 0 })
      continue
    }
    const fit = proficiencyFit(studentLevel, req.requiredLevel)
    const contribution = req.importance * fit
    contributionSum += contribution
    const record = { ...item, studentLevel, proficiencyFit: Math.round(fit * 100) / 100, contribution: Math.round(contribution * 1000) / 1000 }
    if (studentLevel >= req.requiredLevel) matchedSkills.push(record)
    else partialMatches.push(record)
  }

  const rawScore = totalImportance > 0 ? (contributionSum / totalImportance) * 100 : 0
  const criticalSkillsMatched = [...matchedSkills, ...partialMatches].filter(
    (s) => s.requirementCategory === 'critical',
  )
  const criticalSkillsMissing = missingSkills.filter((s) => s.requirementCategory === 'critical')
  const criticalTotal = criticalSkillsMatched.length + criticalSkillsMissing.length
  const criticalPenalty = criticalTotal === 0 ? 1 : 0.75 + 0.25 * (criticalSkillsMatched.length / criticalTotal)
  const matchScore = Math.round(Math.min(100, Math.max(0, rawScore * criticalPenalty)))

  const byImportance = (a, b) => b.importance - a.importance
  const strengths = [...matchedSkills].sort(byImportance).slice(0, 3)
  const developmentAreas = [...criticalSkillsMissing, ...missingSkills.filter((s) => s.requirementCategory !== 'critical')]
    .sort(byImportance)
    .slice(0, 3)

  return {
    role: {
      id: role.id,
      name: role.name,
      domain: role.domain,
      description: role.description,
      primaryFocus: role.primaryFocus,
    },
    matchScore,
    matchCategory: getMatchCategory(matchScore),
    rawScore: Math.round(rawScore * 10) / 10,
    criticalPenalty: Math.round(criticalPenalty * 1000) / 1000,
    matchedSkills: matchedSkills.sort(byImportance),
    partialMatches: partialMatches.sort(byImportance),
    missingSkills: missingSkills.sort(byImportance),
    criticalSkillsMatched,
    criticalSkillsMissing,
    strengths,
    developmentAreas,
    coverage: {
      matched: matchedSkills.length,
      partial: partialMatches.length,
      missing: missingSkills.length,
      total: requirements.length,
      criticalMatched: criticalSkillsMatched.length,
      criticalMissing: criticalSkillsMissing.length,
      criticalTotal,
    },
  }
}

/** Match against all six roles, ranked highest score first. */
export function matchAllRoles(canonicalSkills) {
  return ROLES.map((role) => matchRole(canonicalSkills, role)).sort(
    (a, b) => b.matchScore - a.matchScore,
  )
}
