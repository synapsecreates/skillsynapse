// Source Mapping Layer (Phase 3).
// Abstraction over standardized occupational intelligence sources.
// The MVP works fully on local structured data; each role exposes which
// external sources its profile is aligned with so future live ingestion
// (ESCO / O*NET APIs, employer validation) can plug in without changing
// consumers. No fabricated official occupation IDs are stored anywhere.

export const INTELLIGENCE_SOURCES = {
  esco: {
    id: 'esco',
    name: 'ESCO',
    fullName: 'European Skills, Competences, Qualifications and Occupations',
    kind: 'Standardized Occupation Reference',
    description:
      'Multilingual classification of occupations, skills and qualifications maintained as a European standard.',
    roleInSynapse:
      'Provides the occupation framing each SkillSynapse role profile is mapped against.',
  },
  onet: {
    id: 'onet',
    name: 'O*NET',
    fullName: 'Occupational Information Network',
    kind: 'Standardized Occupation Reference',
    description:
      'US occupational database describing work activities, skills and knowledge areas per occupation.',
    roleInSynapse:
      'Provides the skill and work-activity detail each SkillSynapse role profile is aligned with.',
  },
  unified: {
    id: 'unified',
    name: 'SkillSynapse Unified',
    fullName: 'SkillSynapse Unified Role Profile',
    kind: 'Unified SkillSynapse Intelligence',
    description:
      'Local synthesis of source-aligned occupation mappings into one role-specific skill requirement profile.',
    roleInSynapse:
      'The single profile future matching, gap and recommendation engines consume.',
  },
}

// Future extension points (no UI yet): employer validation records may add
// { validationSource, validationScore, feedbackCount, emergingSkillFlag };
// institutional / district aggregation may add
// { institutionId, degree, branch, academicYear } and
// { districtId, state, region }.
export function getRoleSourceCards(role) {
  const mapping = role.sourceMappings ?? {}
  return ['esco', 'onet'].map((sourceId) => {
    const source = INTELLIGENCE_SOURCES[sourceId]
    const map = mapping[sourceId] ?? { available: false, mappedOccupation: null }
    return { source, mapping: map }
  })
}
