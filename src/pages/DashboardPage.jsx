import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  LayoutDashboard,
  UserRound,
  Target,
  GitCompareArrows,
  ListChecks,
  FileText,
  Trophy,
  TriangleAlert,
  Compass,
} from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/shared/Card'
import { PageHeader, Badge, EmptyState } from '../components/shared/ui'
import { loadProfile } from '../services/profileStorage'
import { adaptStudentProfile } from '../services/studentProfileAdapter'
import { matchAllRoles } from '../services/roleMatching'
import { buildCareerSnapshot } from '../services/careerSnapshot'

const JOURNEY = [
  { to: '/profile', icon: UserRound, title: 'Student Profile', text: 'Keep your skills and interests up to date.' },
  { to: '/role-matching', icon: Target, title: 'Role Matching', text: 'Which roles fit your current skills?' },
  { to: '/skill-gap', icon: GitCompareArrows, title: 'Skill Gap Analysis', text: 'Where do you stand vs industry needs?' },
  { to: '/recommendations', icon: ListChecks, title: 'Recommendations', text: 'What should you learn next?' },
  { to: '/report', icon: FileText, title: 'Career Report', text: 'Your strengths, gaps and next steps.' },
]

const BAND_TONES = {
  'Role Ready': 'emerald',
  Progressing: 'blue',
  Developing: 'amber',
  'Early Stage': 'slate',
}

export function DashboardPage() {
  // Fresh from localStorage on every mount — always reflects current data.
  const [stored] = useState(loadProfile)
  const adapted = useMemo(() => adaptStudentProfile(stored.profile), [stored.profile])
  const matches = useMemo(() => matchAllRoles(adapted.skills), [adapted.skills])
  const snapshot = useMemo(
    () => buildCareerSnapshot(adapted.skills, matches[0]?.role.id, stored.profile.name),
    [adapted.skills, matches, stored.profile.name],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title={stored.profile.name ? `Welcome, ${stored.profile.name.split(' ')[0]}` : 'Dashboard'}
        description="Your career intelligence at a glance — readiness, strongest role match, top gap and next action, all derived from your current profile."
        actions={
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Update profile <ArrowRight size={15} />
          </Link>
        }
      />

      {!snapshot ? (
        <Card>
          <EmptyState
            icon={Compass}
            title="Complete your skill profile to generate your career intelligence"
            description="Add your skills in the Student Profile and this dashboard will show your readiness, strongest role match, top skill gap and recommended next step."
          />
          <div className="flex justify-center border-t border-slate-100 px-6 py-4">
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Go to Student Profile <ArrowRight size={15} />
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Readiness + strongest match */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader
                title="Career readiness"
                subtitle={`Preparedness for ${snapshot.targetRole.name}`}
                action={<Badge tone={BAND_TONES[snapshot.readiness.band]}>{snapshot.readiness.band}</Badge>}
              />
              <CardBody className="flex items-center gap-5">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-3xl font-extrabold text-white">
                  {snapshot.readiness.score}
                  <span className="absolute -bottom-1 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-white">
                    {snapshot.readiness.score}%
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-500">
                  Weighted share of {snapshot.targetRole.name} requirements currently fulfilled.
                  Based on your current profile and mapped role requirements.
                </p>
              </CardBody>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader
                title="Strongest role match"
                subtitle={`Rank #${snapshot.roleMatch.rank} of ${snapshot.roleMatch.totalRoles} mapped roles`}
                action={<Badge tone="blue">{snapshot.roleMatch.category}</Badge>}
              />
              <CardBody>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xl font-bold text-slate-900">{snapshot.roleMatch.strongestRole.name}</p>
                  <p className="text-2xl font-extrabold text-blue-700">{snapshot.roleMatch.score}%</p>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                    style={{ width: `${snapshot.roleMatch.score}%` }}
                  />
                </div>
                <Link
                  to="/role-matching"
                  className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-blue-700 hover:text-blue-800"
                >
                  <Trophy size={14} /> See full ranking <ArrowRight size={14} />
                </Link>
              </CardBody>
            </Card>
          </div>

          {/* Top matches chart (real match scores) */}
          <Card>
            <CardHeader
              title="Top role matches"
              subtitle="Deterministic alignment scores across all mapped roles"
            />
            <CardBody className="space-y-2.5">
              {matches.slice(0, 5).map((m) => (
                <div key={m.role.id} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 truncate text-[13px] font-medium text-slate-700">
                    {m.role.name}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                      style={{ width: `${m.matchScore}%` }}
                    />
                  </div>
                  <span className="w-11 shrink-0 text-right text-[13px] font-bold text-slate-800">
                    {m.matchScore}%
                  </span>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Top gap + next action */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="Highest priority skill gap"
                subtitle="Most urgent development area for your target role"
                action={
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <TriangleAlert size={19} />
                  </span>
                }
              />
              <CardBody>
                {snapshot.criticalAreas.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No open gaps — you meet the mapped requirements for {snapshot.targetRole.name}.
                  </p>
                ) : (
                  (() => {
                    const gap = snapshot.criticalAreas[0]
                    return (
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-lg font-bold text-slate-900">{gap.skillName}</p>
                          <Badge tone="amber">{gap.priorityLabel}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {gap.requirementCategory} requirement · gap of {gap.gapLevels} level
                          {gap.gapLevels === 1 ? '' : 's'} · severity {Math.round(gap.gapSeverity * 100)}%
                        </p>
                        <Link
                          to={`/skill-gap?role=${snapshot.targetRole.id}`}
                          className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-blue-700 hover:text-blue-800"
                        >
                          Analyze all gaps <ArrowRight size={14} />
                        </Link>
                      </div>
                    )
                  })()
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Recommended next action"
                subtitle="Highest priority step from your development plan"
                action={
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <ListChecks size={19} />
                  </span>
                }
              />
              <CardBody>
                {snapshot.primaryPlan.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No urgent actions — explore optional advancement on the Recommendations page.
                  </p>
                ) : (
                  (() => {
                    const rec = snapshot.primaryPlan[0]
                    return (
                      <div>
                        <p className="text-lg font-bold text-slate-900">{rec.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {rec.studentLevelLabel} → {rec.requiredLevelLabel} · {rec.action}
                        </p>
                        <Link
                          to={`/recommendations?role=${snapshot.targetRole.id}`}
                          className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-blue-700 hover:text-blue-800"
                        >
                          View full plan <ArrowRight size={14} />
                        </Link>
                      </div>
                    )
                  })()
                )}
              </CardBody>
            </Card>
          </div>

          {/* Gap distribution (real counts; optional extras complete the total) */}
          <Card>
            <CardHeader
              title="Skill gap distribution"
              subtitle={`${snapshot.counts.totalRequired} mapped requirements for ${snapshot.targetRole.name}`}
            />
            <CardBody>
              {(() => {
                const optional =
                  snapshot.counts.totalRequired -
                  snapshot.counts.strengths -
                  snapshot.counts.partial -
                  snapshot.counts.missing
                const segs = [
                  { count: snapshot.counts.strengths, cls: 'bg-emerald-500', label: 'strengths' },
                  { count: snapshot.counts.partial, cls: 'bg-blue-500', label: 'partial gaps' },
                  { count: snapshot.counts.missing, cls: 'bg-amber-400', label: 'missing' },
                  { count: optional, cls: 'bg-slate-300', label: 'optional extras' },
                ]
                return (
                  <>
                    <div
                      className="flex h-4 overflow-hidden rounded-full bg-slate-100"
                      role="img"
                      aria-label={`${snapshot.counts.strengths} strengths, ${snapshot.counts.partial} partial gaps, ${snapshot.counts.missing} missing skills, ${optional} optional extras`}
                    >
                      {segs.map((seg, i) =>
                        seg.count > 0 ? (
                          <div
                            key={i}
                            className={seg.cls}
                            style={{ width: `${(seg.count / Math.max(1, snapshot.counts.totalRequired)) * 100}%` }}
                          />
                        ) : null,
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-[13px] text-slate-600">
                      {segs.map((seg, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5">
                          <span className={`h-2.5 w-2.5 rounded-full ${seg.cls}`} /> {seg.count} {seg.label}
                        </span>
                      ))}
                    </div>
                  </>
                )
              })()}
            </CardBody>
          </Card>
        </>
      )}

      {/* Journey shortcuts */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <LayoutDashboard size={16} className="text-slate-400" /> Your career journey
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {JOURNEY.map((s) => (
            <Link key={s.to} to={s.to}>
              <Card className="group h-full transition hover:-translate-y-0.5 hover:shadow-lg">
                <CardBody>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <s.icon size={19} />
                  </div>
                  <p className="mt-4 text-[15px] font-semibold text-slate-900">{s.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{s.text}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-blue-700">
                    Open <ArrowRight size={14} />
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
