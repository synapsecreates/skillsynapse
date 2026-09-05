import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  GitCompareArrows,
  ArrowRight,
  CircleCheck,
  CircleDashed,
  CircleX,
  Sparkles,
  Trophy,
  Flag,
} from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/shared/Card'
import { PageHeader, Badge, EmptyState } from '../components/shared/ui'
import { cn } from '../utils/cn'
import { loadProfile } from '../services/profileStorage'
import { adaptStudentProfile } from '../services/studentProfileAdapter'
import { getAllRoles, getRoleById, REQUIREMENT_LEVEL_LABELS } from '../services/industryIntelligence'
import { matchAllRoles } from '../services/roleMatching'
import { analyzeSkillGaps } from '../services/skillGapAnalysis'

const PRIORITY_TONES = {
  'Highest Priority': 'amber',
  'High Priority': 'blue',
  'Medium Priority': 'violet',
  'Low Priority': 'slate',
}

const CATEGORY_TONES = {
  critical: 'amber',
  core: 'blue',
  supporting: 'violet',
  complementary: 'slate',
}

function levelName(level) {
  return level > 0 ? REQUIREMENT_LEVEL_LABELS[level] : 'Not Yet Added'
}

export function SkillGapPage() {
  // Fresh from localStorage on every mount: analysis always uses current data.
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

  const analysis = useMemo(
    () => analyzeSkillGaps(adapted.skills, selectedRole),
    [adapted.skills, selectedRole],
  )

  const selectRole = (id) => {
    setSelectedId(id)
    setSearchParams({ role: id }, { replace: true })
  }

  const hasSkills = adapted.skills.length > 0
  const complete = hasSkills && analysis.prioritizedGaps.length === 0
  const { summary } = analysis

  return (
    <div className="space-y-6">
      {/* SECTION 1 — Header */}
      <PageHeader
        eyebrow="Intelligence"
        title="Skill Gap Analysis"
        description="Understand what you already know and what you need to develop for your target role."
        actions={
          <>
            <Badge tone={hasSkills ? 'blue' : 'slate'}>
              {adapted.skills.length} skill{adapted.skills.length === 1 ? '' : 's'} analyzed
            </Badge>
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Edit profile <ArrowRight size={15} />
            </Link>
          </>
        }
      />

      {/* SECTION 2 — Target role selection */}
      <section aria-label="Target role selection">
        <p className="mb-3 text-sm font-semibold text-slate-700">
          Target role{' '}
          <span className="font-normal text-slate-400">
            · strongest match preselected, switch freely
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => {
            const active = r.id === selectedRole.id
            const score = matches.find((m) => m.role.id === r.id)?.matchScore
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
                <span className={cn('text-[11px] font-bold', active ? 'text-blue-100' : 'text-slate-400')}>
                  {score ?? 0}%
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {!hasSkills ? (
        <Card>
          <EmptyState
            icon={GitCompareArrows}
            title="Add skills to analyze your gaps"
            description="Add skills to your Student Profile to analyze your skill gaps. The full analysis for any target role appears here automatically."
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
          {/* SECTION 3 — Gap summary */}
          <Card>
            <CardHeader
              title={`Gap summary · ${selectedRole.name}`}
              subtitle={selectedRole.description}
              action={
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone="violet">{selectedRole.domain}</Badge>
                  <Link
                    to={`/recommendations?role=${selectedRole.id}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-blue-700"
                  >
                    Get Development Plan <ArrowRight size={14} />
                  </Link>
                </div>
              }
            />
            <CardBody>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  { label: 'Required skills', value: summary.totalRequiredSkills },
                  { label: 'Strengths', value: summary.strengthsCount },
                  { label: 'Partial gaps', value: summary.partialGapsCount },
                  { label: 'Missing skills', value: summary.missingSkillsCount },
                  { label: 'Critical gaps', value: summary.criticalGapsCount },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {complete ? (
            <Card className="border-emerald-200 bg-emerald-50/60">
              <CardBody className="flex items-start gap-3">
                <Trophy size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-[15px] font-semibold text-slate-900">
                    Fully aligned with {selectedRole.name} 🎉
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Every requirement is met or exceeded — no prioritized gaps. Switch target roles
                    to find your next challenge.
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            /* SECTION 4 — Priority development areas */
            <section aria-label="Priority development areas">
              <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <Flag size={15} className="text-slate-400" /> Priority development areas{' '}
                <span className="font-normal text-slate-400">· most important gaps first</span>
              </p>
              <div className="grid gap-3">
                {analysis.prioritizedGaps.map((gap, index) => (
                  <div key={gap.skillId} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-[15px] font-semibold text-slate-900">{gap.skillName}</p>
                          <p className="text-xs text-slate-400">{gap.skillCategory}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={PRIORITY_TONES[gap.priorityLabel]}>{gap.priorityLabel}</Badge>
                        <Badge tone={CATEGORY_TONES[gap.requirementCategory]}>
                          {gap.requirementCategory}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current</p>
                        <p className="font-semibold text-slate-700">{levelName(gap.studentLevel)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Target</p>
                        <p className="font-semibold text-slate-700">{levelName(gap.requiredLevel)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Gap · severity {Math.round(gap.gapSeverity * 100)}%
                        </p>
                        <p className="font-semibold text-slate-700">
                          {gap.gapLevels} level{gap.gapLevels === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 5 — Current strengths */}
          <Card>
            <CardHeader
              title={`Current strengths (${summary.strengthsCount})`}
              subtitle="Requirements already met or exceeded"
              action={
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CircleCheck size={19} />
                </span>
              }
            />
            <CardBody>
              {analysis.strengths.length === 0 ? (
                <p className="text-sm text-slate-400">No strengths for this role yet — every requirement is a gap.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {analysis.strengths.map((s) => (
                    <div key={s.skillId} className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{s.skillName}</p>
                        <p className="text-xs text-slate-400">{s.requirementCategory}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700">
                        {levelName(s.studentLevel)} · req. {levelName(s.requiredLevel)} ✓
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* SECTION 6 — Partial gaps */}
          <Card>
            <CardHeader
              title={`Partial gaps (${summary.partialGapsCount})`}
              subtitle="Present, but below the required level"
              action={
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CircleDashed size={19} />
                </span>
              }
            />
            <CardBody>
              {analysis.partialGaps.length === 0 ? (
                <p className="text-sm text-slate-400">None — held skills all meet their bar, or are missing entirely.</p>
              ) : (
                <div className="space-y-2">
                  {analysis.partialGaps.map((g) => (
                    <div key={g.skillId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-2.5">
                      <p className="text-sm font-semibold text-slate-900">{g.skillName}</p>
                      <p className="text-[13px] font-medium text-slate-500">
                        {levelName(g.studentLevel)} <span className="text-slate-300">→</span>{' '}
                        {levelName(g.requiredLevel)}{' '}
                        <span className="font-semibold text-blue-700">· gap {g.gapLevels}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* SECTION 7 — Missing skills */}
          <Card>
            <CardHeader
              title={`Missing skills (${summary.missingSkillsCount})`}
              subtitle="Required but not in the student profile — sorted by priority"
              action={
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <CircleX size={19} />
                </span>
              }
            />
            <CardBody>
              {analysis.missingSkills.length === 0 ? (
                <p className="text-sm text-slate-400">Nothing missing (outside optional extras).</p>
              ) : (
                <div className="space-y-2">
                  {analysis.missingSkills.map((g) => (
                    <div key={g.skillId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{g.skillName}</p>
                        <Badge tone={CATEGORY_TONES[g.requirementCategory]}>{g.requirementCategory}</Badge>
                      </div>
                      <p className="text-[13px] font-medium text-slate-500">
                        Not Yet Added <span className="text-slate-300">→</span> {levelName(g.requiredLevel)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* SECTION 8 — Optional / future skills */}
          {analysis.optionalSkills.length > 0 ? (
            <Card>
              <CardHeader
                title={`Future enhancements (${analysis.optionalSkills.length})`}
                subtitle="Complementary extras — an additional advantage, not urgent"
                action={
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Sparkles size={19} />
                  </span>
                }
              />
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  {analysis.optionalSkills.map((g) => (
                    <span key={g.skillId} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-500">
                      {g.skillName}
                      <span className="text-[11px] text-slate-400">· target {levelName(g.requiredLevel)}</span>
                    </span>
                  ))}
                </div>
              </CardBody>
            </Card>
          ) : null}
        </>
      )}
    </div>
  )
}
