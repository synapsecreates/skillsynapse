// Deterministic demo student cohort (Phase 8).
// DEMO / PROTOTYPE data: fixed, seeded generation — no randomness across
// refreshes. Each record mirrors the student schema so the EXISTING gap,
// matching and readiness engines can analyze every demo student:
// { id, name, institutionId, districtId, program, academicYear, targetRole,
//   skills: [{ canonicalSkillId, level 1-5 }] }

import { DEMO_INSTITUTIONS } from './demoIdentities'

// [skillId, maxLevel, baseProbability] per program
const PROGRAM_AFFINITIES = {
  'B.Tech CSE': {
    roles: ['frontend_developer', 'backend_developer', 'full_stack_developer'],
    skills: [
      ['javascript', 4, 0.85], ['html', 4, 0.8], ['css', 4, 0.8], ['react', 3, 0.55],
      ['nodejs', 3, 0.5], ['python', 3, 0.6], ['java', 3, 0.5], ['c', 3, 0.7],
      ['cpp', 3, 0.45], ['sql', 3, 0.55], ['git', 3, 0.6], ['github', 2, 0.4],
      ['linux', 2, 0.35], ['rest_apis', 3, 0.4], ['databases', 3, 0.4],
      ['typescript', 3, 0.3], ['responsive_design', 3, 0.45],
    ],
  },
  'B.Tech ECE': {
    roles: ['backend_developer', 'full_stack_developer', 'data_analyst'],
    skills: [
      ['c', 4, 0.85], ['cpp', 3, 0.6], ['python', 3, 0.55], ['java', 2, 0.35],
      ['javascript', 2, 0.35], ['html', 2, 0.4], ['css', 2, 0.35], ['sql', 2, 0.4],
      ['excel', 3, 0.5], ['git', 2, 0.35], ['linux', 2, 0.4], ['statistics', 2, 0.35],
    ],
  },
  BCA: {
    roles: ['frontend_developer', 'full_stack_developer', 'data_analyst'],
    skills: [
      ['html', 4, 0.85], ['css', 4, 0.8], ['javascript', 3, 0.7], ['react', 3, 0.45],
      ['python', 2, 0.45], ['java', 2, 0.4], ['c', 3, 0.6], ['sql', 3, 0.6],
      ['excel', 3, 0.55], ['git', 2, 0.4], ['responsive_design', 3, 0.4],
      ['nodejs', 2, 0.3], ['power_bi', 2, 0.3],
    ],
  },
  'B.Sc Data Science': {
    roles: ['data_analyst', 'data_scientist', 'ai_ml_engineer'],
    skills: [
      ['python', 4, 0.9], ['statistics', 4, 0.85], ['excel', 4, 0.8], ['sql', 3, 0.7],
      ['pandas', 3, 0.65], ['numpy', 3, 0.6], ['data_visualization', 3, 0.6],
      ['power_bi', 3, 0.5], ['machine_learning', 3, 0.45], ['data_preprocessing', 3, 0.45],
      ['scikit_learn', 2, 0.3], ['deep_learning', 2, 0.2], ['c', 2, 0.3], ['git', 2, 0.35],
    ],
  },
}

const INSTITUTION_PROGRAMS = {
  inst_north: ['B.Tech CSE', 'B.Tech ECE'],
  inst_east: ['BCA', 'B.Sc Data Science'],
  inst_south: ['B.Tech CSE', 'B.Sc Data Science'],
}

// Deterministic PRNG (mulberry32) — same cohort on every load.
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildCohort() {
  const students = []
  let counter = 0
  for (const inst of DEMO_INSTITUTIONS) {
    const programs = INSTITUTION_PROGRAMS[inst.id]
    programs.forEach((program, pIdx) => {
      const affinity = PROGRAM_AFFINITIES[program]
      for (let year = 1; year <= 4; year += 1) {
        for (let k = 0; k < 2; k += 1) {
          counter += 1
          const rand = mulberry32(counter * 7919 + 13)
          const skills = []
          for (const [skillId, maxLevel, prob] of affinity.skills) {
            // Senior students know more skills at higher levels.
            const p = Math.min(0.97, prob + (year - 1) * 0.08)
            if (rand() < p) {
              const cap = Math.min(maxLevel, year + 1)
              const level = Math.max(1, Math.min(5, Math.round(1 + rand() * cap)))
              skills.push({ canonicalSkillId: skillId, level })
            }
          }
          students.push({
            id: `demo_s${String(counter).padStart(2, '0')}`,
            name: `Demo Student ${counter}`,
            institutionId: inst.id,
            districtId: inst.districtId,
            program,
            academicYear: year,
            targetRole: affinity.roles[(counter + pIdx) % affinity.roles.length],
            skills,
          })
        }
      }
    })
  }
  return students
}

export const DEMO_COHORT = buildCohort()
