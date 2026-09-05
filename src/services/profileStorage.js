// Local persistence for the Student Profile (Phase 2).
// No backend yet — data lives in browser localStorage so it survives refresh.
// This module is the only place that touches the storage key, keeping the
// profile object clean for future use as input to matching / gap /
// recommendation / report engines.

export const PROFILE_STORAGE_KEY = 'skillsynapse_student_profile'

export function emptyProfile() {
  return {
    name: '',
    education: {
      level: '',
      degree: '',
      degreeCustom: '',
      branch: '',
    },
    skills: [],
    interests: [],
    careerPreferences: [],
    updatedAt: null,
  }
}

function sanitizeSkill(skill) {
  const name = typeof skill?.name === 'string' ? skill.name.trim() : ''
  let proficiency = Number(skill?.proficiency)
  if (Number.isNaN(proficiency)) proficiency = 50
  proficiency = Math.min(100, Math.max(0, Math.round(proficiency)))
  return { name, proficiency }
}

export function normalizeProfile(raw) {
  const base = emptyProfile()
  if (!raw || typeof raw !== 'object') return base
  const seen = new Set()
  const skills = Array.isArray(raw.skills)
    ? raw.skills
        .map(sanitizeSkill)
        .filter((s) => {
          if (!s.name) return false
          const key = s.name.toLowerCase()
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
    : []
  return {
    name: typeof raw.name === 'string' ? raw.name : '',
    education: {
      level: raw.education?.level ?? '',
      degree: raw.education?.degree ?? '',
      degreeCustom: raw.education?.degreeCustom ?? '',
      branch: raw.education?.branch ?? '',
    },
    skills,
    interests: Array.isArray(raw.interests) ? [...new Set(raw.interests)] : [],
    careerPreferences: Array.isArray(raw.careerPreferences)
      ? [...new Set(raw.careerPreferences)]
      : [],
    updatedAt: raw.updatedAt ?? null,
  }
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) return { profile: emptyProfile(), hasSaved: false }
    return { profile: normalizeProfile(JSON.parse(raw)), hasSaved: true }
  } catch {
    return { profile: emptyProfile(), hasSaved: false }
  }
}

export function saveProfile(profile) {
  const clean = normalizeProfile({ ...profile, updatedAt: new Date().toISOString() })
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(clean))
  return clean
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_STORAGE_KEY)
  return emptyProfile()
}

// Simple, useful validation — not a framework.
export function validateProfile(profile) {
  const errors = {}
  if (!profile.name.trim()) {
    errors.name = 'Please enter your full name.'
  }
  const eduErrors = {}
  if (!profile.education.level) eduErrors.level = 'Select your education level.'
  if (!profile.education.degree) {
    eduErrors.degree = 'Select your degree.'
  } else if (profile.education.degree === 'Other' && !profile.education.degreeCustom.trim()) {
    eduErrors.degreeCustom = 'Please specify your degree.'
  }
  if (!profile.education.branch.trim()) eduErrors.branch = 'Enter your branch / field of study.'
  if (Object.keys(eduErrors).length > 0) errors.education = eduErrors

  const warnings = []
  if (profile.skills.length === 0) {
    warnings.push('Add at least one skill so future analysis has something to work with.')
  }
  return { errors, warnings, valid: Object.keys(errors).length === 0 }
}
