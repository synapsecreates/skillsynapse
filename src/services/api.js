// Future API integration point (Phase 2+).
// Keep all backend / AI calls isolated here. No hardcoded URLs in UI components.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const apiConfig = {
  baseUrl: API_BASE_URL,
}

export async function apiGet(path) {
  if (!API_BASE_URL) {
    throw new Error('API is not configured yet (Phase 1 frontend only).')
  }
  const res = await fetch(`${API_BASE_URL}${path}`)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export const placeholderService = {
  // Intentionally empty in Phase 1. Real matching / gap / recommendation
  // logic will be added in later phases.
  async getNothing() {
    return null
  },
}
