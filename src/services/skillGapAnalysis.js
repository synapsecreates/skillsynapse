// Skill Gap Analysis Engine (Phase 5).
// Deterministic, explainable, local-only: no LLM, no external APIs.
// Compares canonical student skills [{ canonicalSkillId, level 1–5 }] against
// one role's requirements and classifies every requirement as a strength, a
// partial gap, a missing skill, or an optional (complementary, missing) skill.
// Gaps are prioritized — never alphabetically — and the UI consumes the
// result object directly; no gap math lives in components.
//
// Priority:
//   gapSeverity = 1 for missing skills,
//                 (requiredLevel - studentLevel) / requiredLevel for partials
//   priorityScore = round(importance × categoryWeight × gapSeverity × 100)
//   (max possible raw value is 1×1×1, so ×100 already normalizes to 0–100)

import { getCanonicalSkill } from '../utils/skillNormalization'

export const CATEGORY_WEIGHTS = {
  critical: 1.0,
  core: 0.75,
  supporting: 0.45,
  complementary: 0.2,
}

export const PRIORITY_LEVELS = [
  { min: 60, label: 'Highest Priority' },
  { min: 35, label: 'High Priority' },
  { min: 15, label: 'Medium Priority' },
  { min: 0, label: 'Low Priority' },
]

export function getPriorityLabel(score) {
  return PRIORITY_LEVELS.find((p) => score >= p.min)?.label ?? 'Low Priority'
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

function gapSeverity(studentLevel, requiredLevel) {
  if (studentLevel <= 0) return 1
  if (!requiredLevel || requiredLevel <= 0) return 0
  return Math.max(0, (requiredLevel - studentLevel) / requiredLevel)
}

/**
 * Analyze canonical student skills against a single role object
 * (Phase 3 shape: { id, name, domain, description, primaryFocus, skills[] }).
 * Returns { role, summary, strengths, partialGaps, missingSkills,
 * optionalSkills, prioritizedGaps }.
 */
export function analyzeSkillGaps(canonicalSkills, role) {
  const student = toStudentMap(canonicalSkills)
  const requirements = Array.isArray(role?.skills) ? role.skills : []

  const strengths = []
  const partialGaps = []
  const missingSkills = []
  const optionalSkills = []

  for (const req of requirements) {
    const canonical = getCanonicalSkill(req.skillId)
    const studentLevel = student.get(req.skillId) ?? 0
    const base = {
      skillId: req.skillId,
      skillName: canonical?.name ?? req.skillId,
      skillCategory: canonical?.category ?? 'General',
      importance: req.importance,
      requirementCategory: req.requirementCategory,
      requiredLevel: req.requiredLevel,
      studentLevel,
      gapLevels: Math.max(0, req.requiredLevel - studentLevel),
    }

    if (studentLevel >= req.requiredLevel) {
      strengths.push({ ...base, status: 'strength', gapSeverity: 0, priorityScore: 0, priorityLabel: 'No Gap' })
      continue
    }

    const severity = gapSeverity(studentLevel, req.requiredLevel)
    const weight = CATEGORY_WEIGHTS[req.requirementCategory] ?? 0.2
    const priorityScore = Math.round(req.importance * weight * severity * 100)
    const record = {
      ...base,
      status: studentLevel > 0 ? 'partial' : 'missing',
      gapSeverity: Math.round(severity * 100) / 100,
      priorityScore,
      priorityLabel: getPriorityLabel(priorityScore),
    }

    if (studentLevel === 0 && req.requirementCategory === 'complementary') {
      optionalSkills.push({ ...record, status: 'optional' })
    } else if (studentLevel === 0) {
      missingSkills.push(record)
    } else {
      partialGaps.push(record)
    }
  }

  const byPriority = (a, b) => b.priorityScore - a.priorityScore
  partialGaps.sort(byPriority)
  missingSkills.sort(byPriority)
  optionalSkills.sort(byPriority)
  const prioritizedGaps = [...partialGaps, ...missingSkills].sort(byPriority)

  const criticalGapsCount = prioritizedGaps.filter((g) => g.requirementCategory === 'critical').length

  return {
    role: role
      ? { id: role.id, name: role.name, domain: role.domain, description: role.description, primaryFocus: role.primaryFocus }
      : null,
    summary: {
      totalRequiredSkills: requirements.length,
      strengthsCount: strengths.length,
      partialGapsCount: partialGaps.length,
      missingSkillsCount: missingSkills.length,
      optionalSkillsCount: optionalSkills.length,
      criticalGapsCount,
    },
    strengths,
    partialGaps,
    missingSkills,
    optionalSkills,
    prioritizedGaps,
  }
}
