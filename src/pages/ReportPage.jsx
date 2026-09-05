import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FileText,
  ArrowRight,
  Trophy,
  CircleCheck,
  TriangleAlert,
  ListChecks,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/shared/Card'
import { PageHeader, Badge, EmptyState } from '../components/shared/ui'
import { cn } from '../utils/cn'
import { loadProfile } from '../services/profileStorage'
import { adaptStudentProfile } from '../services/studentProfileAdapter'
import { getAllRoles, getRoleById, REQUIREMENT_LEVEL_LABELS } from '../services/industryIntelligence'
import { matchAllRoles } from '../services/roleMatching'
import { buildCareerSnapshot } from '../services/careerSnapshot'

const BAND_TONES = {
  'Role Ready': 'emerald',
  Progressing: 'blue',
  Developing: 'amber',
  'Early Stage': 'slate',
}

function levelName(level) {
  return level > 0 ? REQUIREMENT_LEVEL_LABELS[level] : 'Not Yet Added'
}

function ReadinessRing({ score }) {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="relative h-28 w-28 shrink-0" role="img" aria-label={`Career readiness ${score} percent`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="10" className="stroke-slate-100" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          stroke="url(#readinessGradient)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="readinessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-slate-900">
        {score}
      </span>
    </div>
  )
}

export function ReportPage() {
  const [stored] = useState(loadProfile)
  const adapted = useMemo(() => adaptStudentProfile(stored.profile), [stored.profile])
  const roles = useMemo(() => getAllRoles(), [])
  const matches = useMemo(() => matchAllRoles(adapted.skills), [adapted.skills])
  const [searchParams, setSearchParams] = useSearchParams()

  const paramRole = searchParams.get('role')
  const initialRoleId = roles.some((r) => r.id === paramRole)
    ? paramRole
    : (matches[0]?.role.id ?? roles[0]?.id)
  const [selectedId, setSelectedId] = useState(initialRoleId)
  const selectedRole = getRoleById(selectedId) ?? roles[0]

  const snapshot = useMemo(
    () => buildCareerSnapshot(adapted.skills, selectedRole.id, stored.profile.name),
    [adapted.skills, selectedRole.id, stored.profile.name],
  )

  const selectRole = (id) => {
    setSelectedId(id)
    setSearchParams({ role: id }, { replace: true })
  }

  return (
    <div className="space-y-6">
      {/* Report header */}
      <PageHeader
        eyebrow="Report"
        title="Career Readiness Report"
        description="A consolidated, explainable summary of your role alignment, strengths, gaps and next steps — generated from your current profile data."
        actions={
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Edit profile <ArrowRight size={15} />
          </Link>
        }
      />

      {/* Target role */}
      <section aria-label="Target role selection">
        <p className="mb-3 text-sm font-semibold text-slate-700">
          Target role <span className="font-normal text-slate-400">· report regenerates on switch</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => {
            const active = r.id === selectedRole.id
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => selectRole(r.id)}
                aria-pressed={active}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors',
                  active
                    ? 'border-blue-600 bg-blue-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                {r.name}
              </button>
            )
          })}
        </div>
      </section>

      {!snapshot ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="A Student Profile is required"
            description="Add skills to your Student Profile to generate your personalized Career Readiness Report. Nothing is fabricated — the report is built entirely from your saved data."
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
          {/* SECTION 1 — Report header card */}
          <Card>
            <CardBody className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white">
                <FileText size={22} />
              </span>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Career Readiness Report
                  {snapshot.studentName ? ` · ${snapshot.studentName}` : ''}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Target Role: <span className="font-semibold text-slate-700">{snapshot.targetRole.name}</span>
                  {' '}· Based on your current skill profile and mapped role requirements.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* SECTION 2 — Readiness overview */}
          <Card>
            <CardHeader
              title="Career readiness overview"
              subtitle="Two views of the same underlying data — not duplicate numbers"
            />
            <CardBody>
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <ReadinessRing score={snapshot.readiness.score} />
                <div className="grid flex-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Readiness</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {snapshot.readiness.score}% · {snapshot.readiness.band}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">Weighted share of requirements fulfilled</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Role match</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {snapshot.roleMatch.score}% · {snapshot.roleMatch.category}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">Readiness further discounted for missing critical skills</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Analyzed</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{snapshot.analyzedSkillsCount} skills</p>
                    <p className="mt-0.5 text-xs text-slate-400">Student-declared, canonically normalized</p>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Badge tone={BAND_TONES[snapshot.readiness.band]}>{snapshot.readiness.band}</Badge>
              </div>
            </CardBody>
          </Card>

          {/* SECTION 3 — Overall assessment */}
          <Card className="border-blue-100 bg-gradient-to-br from-blue-50/60 to-violet-50/60">
            <CardBody>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                Overall assessment
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{snapshot.assessment}</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck size={13} /> Deterministic template narrative — no AI involved, no external data.
              </p>
            </CardBody>
          </Card>

          {/* SECTION 4 — Role alignment */}
          <Card>
            <CardHeader title="Role alignment" subtitle="Where this target stands among available roles" />
            <CardBody>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Your strongest role alignment:</p>
                  <p className="mt-0.5 text-lg font-bold text-slate-900">
                    {snapshot.roleMatch.strongestRole.name}{' '}
                    <span className="text-sm font-semibold text-slate-400">
                      · {snapshot.roleMatch.strongestRole.score}% match
                    </span>
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm text-slate-500">
                    {snapshot.targetRole.name} match:{' '}
                    <span className="font-bold text-slate-900">{snapshot.roleMatch.score}%</span>
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-blue-700">
                    Rank #{snapshot.roleMatch.rank} of {snapshot.roleMatch.totalRoles} available roles
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* SECTION 5 — Key strengths */}
          <Card>
            <CardHeader
              title={`Key strengths (${snapshot.strengths.length})`}
              subtitle="Requirements met or exceeded, ordered by role importance"
              action={
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CircleCheck size={19} />
                </span>
              }
            />
            <CardBody>
              {snapshot.strengths.length === 0 ? (
                <p className="text-sm text-slate-400">No met requirements for this role yet — strengths will appear as skills are added.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {snapshot.strengths.map((s) => (
                    <div key={s.skillId} className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{s.skillName}</p>
                        <p className="text-xs text-slate-400">{s.requirementCategory}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700">
                        {levelName(s.studentLevel)} · req. {levelName(s.requiredLevel)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* SECTION 6 — Critical development areas */}
          <Card>
            <CardHeader
              title={`Critical development areas (${snapshot.criticalAreas.length})`}
              subtitle="Most important gaps first — critical and core requirements lead"
              action={
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <TriangleAlert size={19} />
                </span>
              }
            />
            <CardBody>
              {snapshot.criticalAreas.length === 0 ? (
                <p className="text-sm text-slate-400">No development areas — all mapped requirements are met.</p>
              ) : (
                <div className="space-y-2">
                  {snapshot.criticalAreas.map((g) => (
                    <div key={g.skillId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{g.skillName}</p>
                        <Badge tone="slate">{g.requirementCategory}</Badge>
                      </div>
                      <p className="text-[13px] font-medium text-slate-500">
                        {levelName(g.studentLevel)} <span className="text-slate-300">→</span>{' '}
                        {levelName(g.requiredLevel)}{' '}
                        <span className="font-semibold text-blue-700">· {g.priorityLabel}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* SECTION 7 — Primary development plan */}
          <Card>
            <CardHeader
              title={`Primary development plan (${snapshot.primaryPlan.length})`}
              subtitle="Top Phase 6 recommendations for this target role"
              action={
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ListChecks size={19} />
                </span>
              }
            />
            <CardBody>
              {snapshot.primaryPlan.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No urgent actions — requirements are met
                  {snapshot.optionalCount > 0 ? ` (${snapshot.optionalCount} optional advancement${snapshot.optionalCount === 1 ? '' : 's'} available on the Recommendations page).` : '.'}
                </p>
              ) : (
                <ol className="space-y-3">
                  {snapshot.primaryPlan.map((rec, index) => (
                    <li key={rec.skillId} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[15px] font-semibold text-slate-900">
                          <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
                            {index + 1}
                          </span>
                          {rec.title}
                        </p>
                        <Badge tone="blue">{rec.priorityLabel}</Badge>
                      </div>
                      <p className="mt-2 text-[13px] text-slate-500">
                        Current: <span className="font-semibold text-slate-700">{rec.studentLevelLabel}</span>
                        {' '}· Target: <span className="font-semibold text-slate-700">{rec.requiredLevelLabel}</span>
                        {' '}· Action: <span className="font-semibold text-blue-700">{rec.action}</span>
                      </p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{rec.explanation}</p>
                    </li>
                  ))}
                </ol>
              )}
              {snapshot.additionalCount > 0 || snapshot.optionalCount > 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                  <Link
                    to={`/recommendations?role=${snapshot.targetRole.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Trophy size={15} /> View full development plan <ArrowRight size={15} />
                  </Link>
                  <span className="text-xs text-slate-400">
                    +{snapshot.additionalCount} additional · {snapshot.optionalCount} optional on the Recommendations page
                  </span>
                </div>
              ) : null}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
