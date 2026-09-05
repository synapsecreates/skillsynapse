// District industry demand scenarios (Phase 8.5C).
// DEMO / MVP data: deterministic mapped demand signals per district.
// These are ILLUSTRATIVE scenarios — NOT official labour statistics, NOT
// real-time job postings, NOT live employer data. Each entry pairs a district
// demand level (1–5) with the static role-requirement importance to produce
// normalized industry demand. Student target roles are deliberately NOT an
// input here; aspirations are tracked as a separate signal.

export const DEMAND_SOURCE_TYPE = 'Demo district demand scenario'
export const DEMAND_DATA_STATUS = 'MVP scenario data — not official labour statistics'

function d(skillId, demandLevel) {
  return { skillId, demandLevel, sourceType: DEMAND_SOURCE_TYPE, dataStatus: DEMAND_DATA_STATUS }
}

export const DISTRICT_DEMAND = {
  // Strong web/software services demand.
  dist_north: [
    d('javascript', 5), d('html', 5), d('css', 5), d('react', 5),
    d('typescript', 4), d('nodejs', 4), d('rest_apis', 4), d('responsive_design', 4),
    d('git', 4), d('github', 3), d('databases', 3), d('authentication', 3),
    d('python', 3), d('sql', 3), d('web_accessibility', 3), d('backend_architecture', 2),
    d('docker', 2), d('linux', 2), d('excel', 2),
  ],
  // Higher data/analytics demand.
  dist_east: [
    d('sql', 5), d('excel', 5), d('python', 5), d('statistics', 5),
    d('pandas', 4), d('numpy', 4), d('data_visualization', 4), d('power_bi', 4),
    d('data_preprocessing', 3), d('databases', 3), d('javascript', 3),
    d('machine_learning', 3), d('scikit_learn', 2), d('html', 2), d('git', 2),
    d('rest_apis', 2), d('cloud_fundamentals', 2),
  ],
  // Higher AI/automation demand.
  dist_south: [
    d('python', 5), d('machine_learning', 5), d('statistics', 4), d('deep_learning', 4),
    d('tensorflow', 4), d('pytorch', 4), d('data_preprocessing', 4), d('scikit_learn', 3),
    d('docker', 4), d('cloud_fundamentals', 4), d('linux', 3), d('git', 3),
    d('sql', 3), d('pandas', 3), d('numpy', 3), d('rest_apis', 3), d('databases', 2),
    d('javascript', 2),
  ],
}

export function getDistrictDemand(districtId) {
  return DISTRICT_DEMAND[districtId] ?? []
}
