// Stakeholder aggregation layer (Phase 8).
// Reuses the EXISTING engines — analyzeSkillGaps, matchRole,
// buildCareerSnapshot — over the deterministic demo cohort. No dashboard
// math lives in UI components; everything here is deterministic.
//
// Normalization assumptions (documented for the MVP):
// - Readiness/alignment: 0–100 scores straight from buildCareerSnapshot.
// - Gap severity: Phase 5 gapSeverity (0–1 per requirement instance).
// - Supply(skill): % of in-scope students with level ≥ SUPPLY_THRESHOLD (3).
// - Demand(skill): district demand scenario blended with static role
//   importance — demand = round((level/5) × (0.5 + 0.5 × maxImportance) × 100).
//   Student target roles are NOT an input. Both scales are 0–100 so
//   deficit = demand − supply is directly comparable.
// - Deficit bands: ≥ +25 HIGH DEFICIT · ≥ +8 DEFICIT · > −8 BALANCED ·
//   otherwise SURPLUS.
// - Course relevance: emphasis-weighted mean of skill demand, where skill
//   demand = max importance across ALL roles. Status: ≥0.55 ALIGNED,
//   ≥0.30 AT RISK, else OBSOLETE.

import { analyzeSkillGaps } from './skillGapAnalysis'
import { matchRole } from './roleMatching'
import { buildCareerSnapshot } from './careerSnapshot'
import { getRoleById, getAllRoles } from './industryIntelligence'
import { getCanonicalSkill } from '../utils/skillNormalization'
import { getDistrictDemand, DEMAND_DATA_STATUS } from '../data/stakeholders/districtDemand'

export { DEMAND_DATA_STATUS }

export const SUPPLY_THRESHOLD = 3

function skillName(skillId) {
  return getCanonicalSkill(skillId)?.name ?? skillId
}

function skillCategory(skillId) {
  return getCanonicalSkill(skillId)?.category ?? 'General'
}

// ---- Cohort filtering ----

export function filterCohort(cohort, { institutionId, program, academicYear, districtId } = {}) {
  return cohort.filter(
    (s) =>
      (!institutionId || s.institutionId === institutionId) &&
      (!program || s.program === program) &&
      (!academicYear || s.academicYear === academicYear) &&
      (!districtId || s.districtId === districtId),
  )
}

// ---- Per-student analysis (engine reuse) ----

export function analyzeCohortStudent(student) {
  const role = getRoleById(student.targetRole)
  const gaps = analyzeSkillGaps(student.skills, role)
  const match = matchRole(student.skills, role)
  const snapshot = buildCareerSnapshot(student.skills, student.targetRole, student.name)
  return { student, gaps, match, readiness: snapshot?.readiness.score ?? 0 }
}

// ---- Institution aggregation ----

export function aggregateInstitution(students) {
  const analyses = students.map(analyzeCohortStudent)
  const readinessAvg = avg(analyses.map((a) => a.readiness))
  const alignmentAvg = avg(analyses.map((a) => a.match.matchScore))

  // Per-skill gap stats across the cohort.
  const bySkill = new Map()
  for (const a of analyses) {
    const records = [...a.gaps.partialGaps, ...a.gaps.missingSkills, ...a.gaps.optionalSkills]
    for (const r of records) {
      if (!bySkill.has(r.skillId)) {
        bySkill.set(r.skillId, {
          skillId: r.skillId,
          name: r.skillName,
          category: skillCategory(r.skillId),
          affected: 0,
          severitySum: 0,
          prioritySum: 0,
          importanceSum: 0,
          criticalAffected: 0,
        })
      }
      const s = bySkill.get(r.skillId)
      s.affected += 1
      s.severitySum += r.gapSeverity
      s.prioritySum += r.priorityScore
      s.importanceSum += r.importance
      if (r.requirementCategory === 'critical') s.criticalAffected += 1
    }
  }
  const n = Math.max(1, students.length)
  const skillStats = [...bySkill.values()].map((s) => ({
    ...s,
    affectedPct: Math.round((s.affected / n) * 100),
    avgSeverity: s.severitySum / s.affected,
    avgPriority: s.prioritySum / s.affected,
    avgImportance: s.importanceSum / s.affected,
  }))

  const topGaps = [...skillStats]
    .sort((a, b) => b.avgSeverity * (b.affected / n) - a.avgSeverity * (a.affected / n))
    .slice(0, 8)

  return {
    studentCount: students.length,
    readinessAvg: Math.round(readinessAvg),
    alignmentAvg: Math.round(alignmentAvg),
    majorGapCount: skillStats.filter((s) => s.affectedPct >= 40 && s.avgSeverity >= 0.5).length,
    topMissingSkill: topGaps[0] ?? null,
    skillStats,
    topGaps,
  }
}

export function buildHeatmap(students, dimension = 'program') {
  const agg = aggregateInstitution(students)
  const rows = agg.topGaps.slice(0, 8)
  const cols =
    dimension === 'academicYear'
      ? [1, 2, 3, 4].map((y) => ({ id: y, label: `Year ${y}` }))
      : [...new Set(students.map((s) => s.program))].map((p) => ({ id: p, label: p }))
  const keyOf = (s) => (dimension === 'academicYear' ? s.academicYear : s.program)
  const cells = {}
  for (const row of rows) {
    cells[row.skillId] = {}
    for (const col of cols) {
      const group = students.filter((s) => keyOf(s) === col.id)
      if (group.length === 0) {
        cells[row.skillId][col.id] = null
        continue
      }
      let sevSum = 0
      let count = 0
      for (const st of group) {
        const role = getRoleById(st.targetRole)
        const g = analyzeSkillGaps(st.skills, role)
        const rec = [...g.partialGaps, ...g.missingSkills, ...g.optionalSkills].find(
          (r) => r.skillId === row.skillId,
        )
        if (rec) {
          sevSum += rec.gapSeverity
          count += 1
        }
      }
      cells[row.skillId][col.id] = count === 0 ? 0 : sevSum / group.length
    }
  }
  return { rows, cols, cells }
}

export function gapBand(severity) {
  if (severity == null) return { label: '—', tone: 'slate' }
  if (severity >= 0.6) return { label: 'High Gap', tone: 'amber' }
  if (severity >= 0.3) return { label: 'Moderate Gap', tone: 'blue' }
  return { label: 'Low Gap', tone: 'emerald' }
}

export function generateCurriculumRecommendations(topGaps) {
  return topGaps.slice(0, 5).map((g) => {
    const pct = g.affectedPct
    const sev = g.avgSeverity >= 0.6 ? 'severe' : g.avgSeverity >= 0.3 ? 'widespread moderate' : 'mild'
    let action = `Increase practical ${g.name} project exposure across affected programs.`
    if (g.category === 'AI / Machine Learning' || g.category === 'Data & Databases') {
      action = `Consider faculty development support and lab capacity for ${g.name}, an emerging-area gap.`
    } else if (g.avgImportance >= 0.8) {
      action = `Introduce structured ${g.name} coverage in the core curriculum module.`
    }
    return {
      skillId: g.skillId,
      name: g.name,
      text: `${g.name} shows ${sev} aggregated gaps (${pct}% of cohort affected). ${action}`,
      affectedPct: pct,
      avgSeverity: Math.round(g.avgSeverity * 100) / 100,
    }
  })
}

// ---- Course alignment / obsolescence ----

export function skillDemandMax(skillId) {
  let max = 0
  for (const role of getAllRoles()) {
    const req = role.skills.find((s) => s.skillId === skillId)
    if (req && req.importance > max) max = req.importance
  }
  return max
}

export function assessCurriculum(curriculum) {
  return curriculum.map((mod) => {
    let wSum = 0
    let eSum = 0
    for (const t of mod.skills) {
      wSum += skillDemandMax(t.skillId) * t.emphasis
      eSum += t.emphasis
    }
    const relevance = eSum > 0 ? wSum / eSum : 0
    const heavyEmphasis = mod.skills.some((t) => t.emphasis >= 3)
    let status = 'ALIGNED'
    let action = 'Maintain current coverage; track industry demand each review cycle.'
    if (relevance < 0.3 && heavyEmphasis) {
      status = 'OBSOLETE'
      action = 'Phase down heavy emphasis and reallocate hours to high-demand skills.'
    } else if (relevance < 0.55) {
      status = 'AT RISK'
      action = 'Review module content against current role requirements; refresh topics.'
    }
    return {
      ...mod,
      relevance: Math.round(relevance * 100) / 100,
      heavyEmphasis,
      status,
      action,
      taughtNames: mod.skills.map((t) => skillName(t.skillId)),
    }
  })
}

// ---- District supply / demand (corrected model, Phase 8.5C) ----
// Three SEPARATE signals — never conflated:
// - SUPPLY: % of in-scope students with level ≥ SUPPLY_THRESHOLD (3).
//   Derived from actual student competency only.
// - INDUSTRY DEMAND: district demand scenario (demandLevel 1–5) blended with
//   static role-requirement importance (max across all roles):
//     demand01 = (demandLevel / 5) × (0.5 + 0.5 × maxRoleImportance)
//     demand   = round(demand01 × 100)
//   Student target roles are NOT an input. Skills absent from the district
//   scenario get demand 0. Both scales are 0–100, so
//   deficit = demand − supply is directly comparable.
// - ASPIRATION: target-role distribution of in-scope students (what students
//   want, not what industry demands) — see computeAspirations().
// - Deficit bands: ≥ +25 HIGH DEFICIT · ≥ +8 DEFICIT · > −8 BALANCED ·
//   otherwise SURPLUS.

export function computeSupplyDemand(students, districtId) {
  const n = Math.max(1, students.length)
  const supplyCounts = new Map()
  for (const st of students) {
    const held = new Set(
      st.skills.filter((s) => s.level >= SUPPLY_THRESHOLD).map((s) => s.canonicalSkillId),
    )
    for (const skillId of held) {
      supplyCounts.set(skillId, (supplyCounts.get(skillId) ?? 0) + 1)
    }
  }
  // Industry demand: district scenario × static role importance (max across
  // all roles). Independent of what students aspire to.
  const scenario = new Map(
    getDistrictDemand(districtId).map((d) => [d.skillId, d.demandLevel]),
  )
  const skillIds = new Set([...supplyCounts.keys(), ...scenario.keys()])
  const rows = [...skillIds].map((skillId) => {
    const supplyPct = Math.round(((supplyCounts.get(skillId) ?? 0) / n) * 100)
    const demandLevel = scenario.get(skillId) ?? 0
    const demandScore = Math.round((demandLevel / 5) * (0.5 + 0.5 * skillDemandMax(skillId)) * 100)
    const deficit = demandScore - supplyPct
    let status = 'BALANCED'
    if (deficit >= 25) status = 'HIGH DEFICIT'
    else if (deficit >= 8) status = 'DEFICIT'
    else if (deficit < -8) status = 'SURPLUS'
    return {
      skillId,
      name: skillName(skillId),
      category: skillCategory(skillId),
      supply: supplyPct,
      demand: demandScore,
      demandLevel,
      deficit,
      status,
    }
  })
  // Skills held widely but absent from the district demand scenario appear as
  // SURPLUS — teaching effort without mapped district demand.
  return rows.sort((a, b) => b.deficit - a.deficit)
}

// ---- Student career aspirations (kept, renamed meaning) ----
// Target-role distribution: what students WANT to pursue. Useful context,
// but NOT industry demand — never an input to supply/demand math.
export function computeAspirations(students) {
  const n = Math.max(1, students.length)
  const counts = new Map()
  for (const st of students) {
    if (!st.targetRole) continue
    counts.set(st.targetRole, (counts.get(st.targetRole) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([roleId, count]) => {
      const role = getRoleById(roleId)
      return {
        roleId,
        roleName: role?.name ?? roleId,
        count,
        pct: Math.round((count / n) * 100),
      }
    })
    .sort((a, b) => b.count - a.count)
}

export function districtOverview(students, districtId) {
  const rows = computeSupplyDemand(students, districtId)
  const aspirations = computeAspirations(students)
  const topDeficit = rows[0] ?? null
  const topSurplus = [...rows].reverse().find((r) => r.status === 'SURPLUS') ?? null
  const avgDeficit = rows.length > 0 ? rows.reduce((s, r) => s + Math.abs(r.deficit), 0) / rows.length : 0
  return {
    studentCount: students.length,
    topDeficit,
    topSurplus,
    priorityTraining: topDeficit,
    alignment: Math.max(0, Math.round(100 - avgDeficit)),
    rows,
    aspirations,
    demandSource: 'MVP mapped demand scenario',
  }
}

export function generatePlanningRecommendations(districtData) {
  const recs = []
  const deficits = districtData.rows.filter((r) => r.status === 'HIGH DEFICIT').slice(0, 3)
  for (const d of deficits) {
    recs.push({
      skillId: d.skillId,
      text: `Prioritize ${d.name} training capacity (demand ${d.demand} vs supply ${d.supply}).`,
      kind: 'deficit',
    })
  }
  const supporting = districtData.rows
    .filter((r) => r.status === 'DEFICIT' && !deficits.some((d) => d.skillId === r.skillId))
    .slice(0, 2)
  for (const d of supporting) {
    recs.push({
      skillId: d.skillId,
      text: `Increase practical ${d.name} training infrastructure to close a moderate gap.`,
      kind: 'deficit',
    })
  }
  if (districtData.topSurplus) {
    recs.push({
      skillId: districtData.topSurplus.skillId,
      text: `Current ${districtData.topSurplus.name} availability (${districtData.topSurplus.supply}) exceeds mapped demand — redeploy some capacity to deficit areas.`,
      kind: 'surplus',
    })
  }
  return recs
}

function avg(nums) {
  if (nums.length === 0) return 0
  return nums.reduce((s, v) => s + v, 0) / nums.length
}
