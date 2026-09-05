// Demo stakeholder identities (Phase 8).
// DEMO / PROTOTYPE data: placeholder identities for institutions, districts
// and the employer partner. Real authenticated users and database records
// can replace these later without touching aggregation logic.

export const DEMO_INSTITUTIONS = [
  { id: 'inst_north', name: 'North Demo Institute of Technology', districtId: 'dist_north', type: 'Engineering College' },
  { id: 'inst_east', name: 'East Demo College of Computer Applications', districtId: 'dist_east', type: 'Arts & Science College' },
  { id: 'inst_south', name: 'South Demo Institute of Technology', districtId: 'dist_south', type: 'Engineering College' },
]

export const DEMO_DISTRICTS = [
  { id: 'dist_north', name: 'North Demo District', state: 'Demo State' },
  { id: 'dist_east', name: 'East Demo District', state: 'Demo State' },
  { id: 'dist_south', name: 'South Demo District', state: 'Demo State' },
]

export const DEMO_PROGRAMS = [
  'B.Tech CSE',
  'B.Tech ECE',
  'BCA',
  'B.Sc Data Science',
]

export const DEMO_EMPLOYER = {
  id: 'emp_demo',
  name: 'Demo Industry Partner',
  sectors: ['Software Development', 'Data', 'Artificial Intelligence'],
}

export function getInstitutionName(id) {
  return DEMO_INSTITUTIONS.find((i) => i.id === id)?.name ?? id
}

export function getDistrictName(id) {
  return DEMO_DISTRICTS.find((d) => d.id === id)?.name ?? id
}
