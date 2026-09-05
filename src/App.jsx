import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { LandingPage } from './pages/LandingPage'
import { ProfilePage } from './pages/ProfilePage'
import { IndustryIntelligencePage } from './pages/IndustryIntelligencePage'
import { RoleMatchingPage } from './pages/RoleMatchingPage'
import { DashboardPage } from './pages/DashboardPage'
import { SkillGapPage } from './pages/SkillGapPage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import { ReportPage } from './pages/ReportPage'
import { InstitutionPage } from './pages/stakeholders/InstitutionPage'
import { DistrictPage } from './pages/stakeholders/DistrictPage'
import { EmployerPage } from './pages/stakeholders/EmployerPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      {/* Public landing page (no app shell) */}
      <Route path="/" element={<LandingPage />} />

      {/* Application pages inside the reusable sidebar layout */}
      <Route element={<AppLayout />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/industry-intelligence" element={<IndustryIntelligencePage />} />
        <Route path="/role-matching" element={<RoleMatchingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Legacy alias: role analysis lives in Role Matching */}
        <Route path="/role-analysis" element={<Navigate to="/role-matching" replace />} />
        <Route path="/skill-gap" element={<SkillGapPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/institution" element={<InstitutionPage />} />
        <Route path="/district" element={<DistrictPage />} />
        <Route path="/employer" element={<EmployerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
