import {
  LayoutDashboard,
  UserRound,
  Factory,
  Target,
  GitCompareArrows,
  ListChecks,
  FileText,
  Landmark,
  MapPinned,
  Building2,
} from 'lucide-react'

export const PORTALS = [
  { id: 'student', label: 'Student Portal' },
  { id: 'institution', label: 'Institutional Portal' },
  { id: 'district', label: 'District Portal' },
  { id: 'employer', label: 'Employer Portal' },
]

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, portal: 'student' },
  { to: '/profile', label: 'My Profile', icon: UserRound, portal: 'student' },
  { to: '/industry-intelligence', label: 'Industry Intelligence', icon: Factory, portal: 'student' },
  { to: '/role-matching', label: 'Role Matching', icon: Target, portal: 'student' },
  { to: '/skill-gap', label: 'Skill Gap Analysis', icon: GitCompareArrows, portal: 'student' },
  { to: '/recommendations', label: 'Recommendations', icon: ListChecks, portal: 'student' },
  { to: '/report', label: 'Career Report', icon: FileText, portal: 'student' },
  { to: '/institution', label: 'Curriculum Alignment', icon: Landmark, portal: 'institution' },
  { to: '/district', label: 'District Planning', icon: MapPinned, portal: 'district' },
  { to: '/employer', label: 'Industry Validation', icon: Building2, portal: 'employer' },
]
