// Role Intelligence Dataset (Phase 3, provenance-hardened in Phase 8.5A).
// WHAT THIS DATA IS: manually curated MVP role profiles. Each requirement
// was hand-mapped against occupational skill frameworks (ESCO and O*NET as
// *reference frameworks only*) and normalized into the SkillSynapse canonical
// skill taxonomy. This is a STATIC curated dataset — NOT live labour-market
// statistics. No values here are scraped, measured, or ML-derived.
// WHAT THIS DATA IS NOT: live web scraping, real-time job monitoring,
// automatic ESCO/O*NET ingestion, or machine-learning output. There are no
// official ESCO/O*NET occupation IDs anywhere in this file — only generic
// occupation-group descriptors (see `sourceMappings`).
//
// FIELD MEANINGS (curated weighting parameters, see methodology.js):
// importance: 0.0–1.0 — how strongly a skill influences role alignment.
// requiredLevel: 1 Awareness, 2 Beginner, 3 Intermediate, 4 Advanced, 5 Expert
//   — expected competency for baseline role readiness.
// requirementCategory: critical | core | supporting | complementary —
//   urgency tier used for gap prioritization and match penalties.
// mappingWeight: 0–1 — CURATED mapping-strength weight recording how firmly
//   the hand mapping is believed to reflect the role. This is an internal
//   authoring parameter, NOT a measured statistical confidence. UI surfaces
//   only coarse coverage bands derived from it, never pseudo-precise %.

function req(skillId, importance, requiredLevel, requirementCategory, mappingWeight) {
  return {
    skillId,
    importance,
    requiredLevel,
    requirementCategory,
    mappingWeight,
    provenance: CURATED_REQUIREMENT_PROVENANCE,
  }
}

// Shared per-requirement provenance (single reference, not duplicated data).
// Every requirement below carries this object: hand-mapped, static, with
// frameworks used as references only and no official source identifiers.
const CURATED_REQUIREMENT_PROVENANCE = Object.freeze({
  mappingType: 'curated',
  sourceFramework: 'unified',
  sourceReference:
    'SkillSynapse curated role-skill mapping; ESCO and O*NET used as occupational framework references only — no official source IDs',
  live: false,
})

// Shared per-role provenance. Each role below references this object and adds
// its own occupation-group descriptors via `sourceMappings`.
export const CURATED_ROLE_PROVENANCE = Object.freeze({
  dataOrigin: 'Curated MVP role profile mapped against occupational skill frameworks',
  dataFreshness: 'Static MVP dataset',
  mappingType: 'curated',
  live: false,
  referenceFrameworks: ['esco', 'onet'],
  lastReviewed: '2026-01',
  methodology:
    'Role requirements are normalized into the SkillSynapse canonical skill taxonomy and weighted for deterministic matching.',
})

export const ROLES = [
  {
    id: 'frontend_developer',
    name: 'Frontend Developer',
    domain: 'Software Development',
    description: 'Builds and maintains user-facing web interfaces and experiences.',
    primaryFocus: 'Modern Web Development',
    sourceMappings: {
      esco: { available: true, mappedOccupation: 'Web and multimedia development occupation group' },
      onet: { available: true, mappedOccupation: 'Web development occupation group' },
    },
    provenance: CURATED_ROLE_PROVENANCE,
    skills: [
      req('javascript', 0.95, 4, 'critical', 0.92),
      req('html', 0.93, 4, 'critical', 0.94),
      req('css', 0.93, 4, 'critical', 0.94),
      req('react', 0.88, 4, 'critical', 0.9),
      req('responsive_design', 0.78, 4, 'core', 0.85),
      req('typescript', 0.7, 3, 'core', 0.82),
      req('web_accessibility', 0.65, 3, 'supporting', 0.78),
      req('git', 0.6, 3, 'supporting', 0.88),
      req('github', 0.5, 2, 'complementary', 0.8),
    ],
  },
  {
    id: 'backend_developer',
    name: 'Backend Developer',
    domain: 'Software Development',
    description: 'Designs server-side logic, APIs and data systems that power applications.',
    primaryFocus: 'Server-side Engineering',
    sourceMappings: {
      esco: { available: true, mappedOccupation: 'Software development occupation group' },
      onet: { available: true, mappedOccupation: 'Software development occupation group' },
    },
    provenance: CURATED_ROLE_PROVENANCE,
    skills: [
      req('nodejs', 0.92, 4, 'critical', 0.9),
      req('rest_apis', 0.9, 4, 'critical', 0.9),
      req('databases', 0.88, 4, 'critical', 0.89),
      req('authentication', 0.8, 3, 'core', 0.84),
      req('javascript', 0.75, 3, 'core', 0.86),
      req('python', 0.72, 3, 'core', 0.83),
      req('docker', 0.62, 3, 'supporting', 0.8),
      req('git', 0.6, 3, 'supporting', 0.88),
      req('linux', 0.55, 2, 'supporting', 0.79),
      req('cloud_fundamentals', 0.5, 2, 'complementary', 0.76),
    ],
  },
  {
    id: 'full_stack_developer',
    name: 'Full Stack Developer',
    domain: 'Software Development',
    description: 'Works across the stack, from responsive interfaces to APIs and databases.',
    primaryFocus: 'End-to-end Product Development',
    sourceMappings: {
      esco: { available: true, mappedOccupation: 'Web and software development occupation group' },
      onet: { available: true, mappedOccupation: 'Software and web development occupation group' },
    },
    provenance: CURATED_ROLE_PROVENANCE,
    skills: [
      req('javascript', 0.93, 4, 'critical', 0.9),
      req('react', 0.85, 4, 'critical', 0.88),
      req('nodejs', 0.85, 4, 'critical', 0.87),
      req('rest_apis', 0.82, 3, 'core', 0.86),
      req('databases', 0.8, 3, 'core', 0.85),
      req('html', 0.78, 3, 'core', 0.9),
      req('css', 0.78, 3, 'core', 0.9),
      req('backend_architecture', 0.7, 3, 'core', 0.8),
      req('authentication', 0.65, 3, 'supporting', 0.8),
      req('typescript', 0.62, 3, 'supporting', 0.79),
      req('git', 0.6, 3, 'supporting', 0.87),
      req('docker', 0.55, 2, 'complementary', 0.77),
    ],
  },
  {
    id: 'data_analyst',
    name: 'Data Analyst',
    domain: 'Data',
    description: 'Turns raw data into reports, dashboards and decisions stakeholders trust.',
    primaryFocus: 'Business Analytics & Reporting',
    sourceMappings: {
      esco: { available: true, mappedOccupation: 'Data analysis occupation group' },
      onet: { available: true, mappedOccupation: 'Data analysis occupation group' },
    },
    provenance: CURATED_ROLE_PROVENANCE,
    skills: [
      req('sql', 0.93, 4, 'critical', 0.92),
      req('excel', 0.88, 4, 'critical', 0.9),
      req('data_visualization', 0.85, 3, 'critical', 0.87),
      req('power_bi', 0.82, 3, 'core', 0.84),
      req('statistics', 0.78, 3, 'core', 0.85),
      req('python', 0.6, 2, 'supporting', 0.81),
      req('pandas', 0.58, 2, 'supporting', 0.8),
      req('numpy', 0.5, 2, 'complementary', 0.77),
    ],
  },
  {
    id: 'data_scientist',
    name: 'Data Scientist',
    domain: 'Data',
    description: 'Builds statistical and machine learning models to explain and predict behaviour.',
    primaryFocus: 'Statistical Modelling & ML',
    sourceMappings: {
      esco: { available: true, mappedOccupation: 'Data science occupation group' },
      onet: { available: true, mappedOccupation: 'Data science occupation group' },
    },
    provenance: CURATED_ROLE_PROVENANCE,
    skills: [
      req('python', 0.93, 4, 'critical', 0.91),
      req('statistics', 0.88, 4, 'critical', 0.88),
      req('machine_learning', 0.9, 4, 'critical', 0.89),
      req('pandas', 0.85, 3, 'core', 0.87),
      req('numpy', 0.82, 3, 'core', 0.86),
      req('scikit_learn', 0.85, 3, 'core', 0.85),
      req('data_preprocessing', 0.8, 3, 'core', 0.84),
      req('data_visualization', 0.62, 3, 'supporting', 0.82),
      req('sql', 0.6, 3, 'supporting', 0.84),
      req('deep_learning', 0.55, 2, 'complementary', 0.78),
    ],
  },
  {
    id: 'ai_ml_engineer',
    name: 'AI / ML Engineer',
    domain: 'Artificial Intelligence',
    description: 'Designs, trains and deploys machine learning systems to production.',
    primaryFocus: 'Production Machine Learning',
    sourceMappings: {
      esco: { available: true, mappedOccupation: 'AI and machine learning occupation group' },
      onet: { available: true, mappedOccupation: 'Machine learning occupation group' },
    },
    provenance: CURATED_ROLE_PROVENANCE,
    skills: [
      req('python', 0.93, 4, 'critical', 0.9),
      req('machine_learning', 0.93, 4, 'critical', 0.89),
      req('deep_learning', 0.88, 4, 'critical', 0.87),
      req('tensorflow', 0.82, 3, 'core', 0.83),
      req('pytorch', 0.82, 3, 'core', 0.83),
      req('scikit_learn', 0.75, 3, 'core', 0.82),
      req('data_preprocessing', 0.72, 3, 'supporting', 0.81),
      req('docker', 0.6, 2, 'supporting', 0.79),
      req('git', 0.55, 2, 'supporting', 0.85),
      req('cloud_fundamentals', 0.58, 2, 'supporting', 0.77),
      req('linux', 0.52, 2, 'complementary', 0.76),
    ],
  },
]

export const ROLE_IDS = ROLES.map((r) => r.id)
