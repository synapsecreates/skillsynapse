// Employer validation store (Phase 8).
// DEMO interactive state: employer relevance/baseline feedback and emerging
// skill proposals. Persisted in localStorage under its own key — the
// canonical industry dataset is NEVER modified. Emerging proposals stay
// "pending" and cannot enter the canonical catalog automatically.

const STORAGE_KEY = 'skillsynapse_employer_feedback'

export const RELEVANCE_OPTIONS = ['relevant', 'needs-review', 'not-relevant']
export const BASELINE_OPTIONS = ['too-low', 'appropriate', 'too-high']

function emptyFeedback() {
  return { relevance: {}, baselines: {}, emerging: [] }
}

function sanitize(raw) {
  const clean = emptyFeedback()
  if (!raw || typeof raw !== 'object') return clean
  if (raw.relevance && typeof raw.relevance === 'object') {
    for (const [roleId, skills] of Object.entries(raw.relevance)) {
      if (!skills || typeof skills !== 'object') continue
      clean.relevance[roleId] = {}
      for (const [skillId, v] of Object.entries(skills)) {
        if (RELEVANCE_OPTIONS.includes(v)) clean.relevance[roleId][skillId] = v
      }
    }
  }
  if (raw.baselines && typeof raw.baselines === 'object') {
    for (const [roleId, skills] of Object.entries(raw.baselines)) {
      if (!skills || typeof skills !== 'object') continue
      clean.baselines[roleId] = {}
      for (const [skillId, v] of Object.entries(skills)) {
        if (BASELINE_OPTIONS.includes(v)) clean.baselines[roleId][skillId] = v
      }
    }
  }
  if (Array.isArray(raw.emerging)) {
    clean.emerging = raw.emerging
      .filter((e) => e && typeof e.name === 'string' && e.name.trim())
      .map((e) => ({
        id: String(e.id ?? `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
        name: e.name.trim().slice(0, 60),
        relatedRoleId: typeof e.relatedRoleId === 'string' ? e.relatedRoleId : '',
        rationale: typeof e.rationale === 'string' ? e.rationale.slice(0, 280) : '',
        status: 'pending',
        createdAt: e.createdAt ?? new Date().toISOString(),
      }))
  }
  return clean
}

export function loadEmployerFeedback() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyFeedback()
    return sanitize(JSON.parse(raw))
  } catch {
    return emptyFeedback()
  }
}

export function saveEmployerFeedback(feedback) {
  const clean = sanitize(feedback)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
  return clean
}

export function setSkillRelevance(feedback, roleId, skillId, value) {
  const next = sanitize(feedback)
  if (!RELEVANCE_OPTIONS.includes(value)) return next
  next.relevance[roleId] = { ...(next.relevance[roleId] ?? {}), [skillId]: value }
  return saveEmployerFeedback(next)
}

export function setBaselineFeedback(feedback, roleId, skillId, value) {
  const next = sanitize(feedback)
  if (!BASELINE_OPTIONS.includes(value)) return next
  next.baselines[roleId] = { ...(next.baselines[roleId] ?? {}), [skillId]: value }
  return saveEmployerFeedback(next)
}

export function proposeEmergingSkill(feedback, { name, relatedRoleId, rationale }) {
  const next = sanitize(feedback)
  next.emerging = [
    ...next.emerging,
    {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: String(name ?? '').trim().slice(0, 60),
      relatedRoleId,
      rationale: String(rationale ?? '').slice(0, 280),
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ]
  return saveEmployerFeedback(next)
}
