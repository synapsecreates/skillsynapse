// Industry Intelligence Methodology (Phase 8.5A).
// Single reusable source of truth describing HOW role intelligence is built,
// WHAT each weight means, WHAT is static/curated, and WHERE future live
// ingestion plugs in. Consumed by the Industry Intelligence UI, matching
// explanations, the Employer Portal, and future README documentation.
// Nothing here is computed from live data — it documents the MVP as built.

export const INTELLIGENCE_METHODOLOGY = {
  headline: 'How this intelligence works',
  datasetStatus: 'Static curated MVP intelligence',
  summary:
    'Current MVP role intelligence is based on curated role-to-skill mappings aligned with occupational frameworks such as ESCO and O*NET. Role requirements are normalized into the SkillSynapse canonical skill taxonomy and used by deterministic matching and gap analysis engines.',
  dataUsed: [
    'Hand-mapped role-to-skill requirements for each supported role',
    'Canonical skill taxonomy (stable IDs, display names, aliases)',
    'Generic ESCO / O*NET occupation-group descriptors used as framework references only',
  ],
  frameworkUse: {
    esco: 'ESCO occupational framework reference — provides occupation framing only. No ESCO IDs are stored or fetched.',
    onet: "O*NET occupational skill framework reference — provides skill-detail framing only. No O*NET IDs are stored or fetched.",
  },
  normalization:
    'Skill mentions from any source resolve to one canonical skill ID via the normalization layer (exact ID, display name, or alias match). Matching, gaps, and recommendations all operate on canonical IDs.',
  weightingUse:
    'Requirement weights (importance, level, category) are curated parameters that drive deterministic scoring — see REQUIREMENT_FIELD_DOCS.',
  staticNote:
    'No live web scraping, no real-time job monitoring, no automatic ESCO/O*NET ingestion, and no machine-learning training exist in this MVP. All values are hand-authored and versioned with the dataset.',
  futureImprovements: [
    'Live ESCO / O*NET ingestion through the normalization layer',
    'Employer validation feedback folded into mapping weights',
    'District/institutional outcome data refining role demand signals',
  ],
}

// Documented meaning of each requirement weight (Part 5). These are
// normalized role-requirement parameters within the MVP intelligence model —
// NOT scientifically validated labour-market statistics.
export const REQUIREMENT_FIELD_DOCS = {
  importance: {
    label: 'Importance',
    range: '0.0 – 1.0',
    meaning: 'How strongly a skill influences alignment for a role. Higher values contribute more to match scores.',
  },
  requiredLevel: {
    label: 'Required level',
    range: '1 Awareness · 2 Beginner · 3 Intermediate · 4 Advanced · 5 Expert',
    meaning: 'Expected competency level for baseline role readiness. Compared directly against the student level.',
  },
  requirementCategory: {
    label: 'Category',
    range: 'critical · core · supporting · complementary',
    meaning: 'Urgency tier: critical and core gaps are prioritized and penalized most; complementary gaps are informational.',
  },
  mappingWeight: {
    label: 'Mapping weight',
    range: '0 – 1',
    meaning:
      'Curated internal authoring parameter recording how firmly a hand mapping reflects the role. NOT a measured statistical confidence — UI shows only coarse coverage bands derived from it.',
  },
}

// Coarse, honest display bands for averaged mapping weights (Option A for UI).
// Thresholds describe curated weights, not measured probabilities.
export const COVERAGE_BANDS = [
  { min: 0.85, label: 'High Coverage' },
  { min: 0.75, label: 'Moderate Coverage' },
  { min: 0, label: 'Reference Mapped' },
]

export function coverageBandFor(avgWeight) {
  return COVERAGE_BANDS.find((b) => avgWeight >= b.min)?.label ?? 'Reference Mapped'
}

// Future live-ingestion architecture (Part 9): clean boundary contract.
// A future ingester implements buildRoleDataset(normalizedRecords) returning
// the roles.js shape; the engines below it never change. Nothing is scraped
// or fetched today — this documents the seam only.
export const FUTURE_INGESTION_STAGES = [
  { stage: 'Approved sources', detail: 'ESCO / O*NET / other approved sources (future)' },
  { stage: 'Raw records', detail: 'Raw occupation / skill data' },
  { stage: 'Normalization layer', detail: 'Existing utils/skillNormalization.js — unchanged' },
  { stage: 'Canonical mapping', detail: 'Resolve to canonical skill IDs (existing taxonomy)' },
  { stage: 'Role requirement builder', detail: 'Produces the roles.js shape incl. provenance' },
  { stage: 'SkillSynapse role intelligence', detail: 'Consumed by matching, gaps, recommendations — unchanged' },
]

export const ROLE_DATASET_CONTRACT = {
  seam: 'src/data/intelligence/roles.js is the single dataset seam',
  requirementShape: ['skillId (canonical)', 'importance (0–1)', 'requiredLevel (1–5)', 'requirementCategory', 'mappingWeight (0–1, curated)', 'provenance (shared frozen object)'],
  roleShape: ['id', 'name', 'domain', 'description', 'primaryFocus', 'sourceMappings (generic descriptors, no official IDs)', 'provenance (shared frozen object)', 'skills[]'],
}
