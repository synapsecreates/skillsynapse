import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  UserRound,
  ArrowRight,
  ArrowLeftRight,
  Scale,
  Trophy,
  CircleCheck,
  CircleDashed,
  CircleX,
  TriangleAlert,
  ChevronRight,
} from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/shared/Card'
import { PageHeader, Badge, EmptyState } from '../components/shared/ui'
import { cn } from '../utils/cn'
import { loadProfile } from '../services/profileStorage'
import { adaptStudentProfile } from '../services/studentProfileAdapter'
import { matchAllRoles } from '../services/roleMatching'
import { REQUIREMENT_LEVEL_LABELS } from '../services/industryIntelligence'

const CATEGORY_TONES = {
  'Strong Match': 'emerald',
  'Good Match': 'blue',
  'Developing Match': 'amber',
  'Low Current Match': 'slate',
}

const PIPELINE_STEPS = [
  'Student Skills',
  'Skill Normalization',
  'Requirement Comparison',
  'Weighted Scoring',
  'Ranked Roles',
]

function ScoreBar({ score }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200/70"
        role="img"
        aria-label={`Match score ${score} percent`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-11 shrink-0 text-right text-sm font-bold text-slate-900">{score}%</span>
    </div>
  )
}

export function RoleMatchingPage() {
  // Reloaded from localStorage on every mount, so results always reflect the
  // currently stored profile (TEST 5: edit profile → return → fresh ranking).
  const [stored] = useState(loadProfile)
  const adapted = useMemo(() => adaptStudentProfile(stored.profile), [stored.profile])
  const results = useMemo(() => matchAllRoles(adapted.skills), [adapted.skills])
  const [selectedId, setSelectedId] = useState(results[0]?.role.id)
  const selected = results.find((r) => r.role.id === selectedId) ?? results[0]
  const primary = results[0]
  const hasSkills = adapted.skills.length > 0

  return (
    <div className="space-y-6">
      {/* SECTION 1 — Header */}
      <PageHeader
        eyebrow="Intelligence"
        title="Role Matching"
        description="Compare your current skills against structured industry role intelligence."
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

      {/* SECTION 2 — Student profile summary */}
      <Card>
        <CardHeader
          title="Skills used for this analysis"
          subtitle={
            hasSkills
              ? 'Canonical profile produced by the adapter from your saved Student Profile.'
              : 'No analyzable skills found in your saved profile yet.'
          }
          action={
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserRound size={19} />
            </span>
          }
        />
        <CardBody>
          {!hasSkills ? (
            <p className="text-sm text-slate-400">
              {stored.hasSaved
                ? 'Your saved profile has no skills the matching engine recognizes yet.'
                : 'You have not saved a Student Profile in this browser yet.'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {adapted.skills.map((s) => (
                <span
                  key={s.canonicalSkillId}
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[13px] font-medium text-blue-800"
                >
                  {s.sourceName}
                  <span className="text-[11px] font-semibold text-blue-500">
                    · {REQUIREMENT_LEVEL_LABELS[s.level]}
                  </span>
                </span>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {!hasSkills ? (
        /* PART 6 — Empty profile state: no fake scores. */
        <Card>
          <EmptyState
            icon={ArrowLeftRight}
            title="Add skills to unlock role matches"
            description="Add skills to your Student Profile to generate personalized role matches. Rankings appear here automatically once your profile has recognizable skills."
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
          {/* SECTION 3 — Matching process visualization (compact) */}
          <Card>
            <CardBody className="py-4">
              <ol className="flex flex-wrap items-center gap-y-2">
                {PIPELINE_STEPS.map((step, i) => (
                  <li key={step} className="flex items-center">
                    <span className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                      {step}
                    </span>
                    {i < PIPELINE_STEPS.length - 1 ? (
                      <ChevronRight size={14} className="mx-1 shrink-0 text-slate-300" aria-hidden />
                    ) : null}
                  </li>
                ))}
              </ol>
              <p className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400">
                <Scale size={13} /> Role alignment calculated from your skill profile and mapped
                role requirements: importance × proficiency fit, with a transparent penalty for
                missing critical skills. No AI prediction, no external data.
              </p>
            </CardBody>
          </Card>

          {/* SECTION 5 — Primary match */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-600 to-violet-600 text-white">
            <CardBody>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
                <Trophy size={14} /> Strongest alignment
              </p>
              <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{primary.role.name}</h2>
                  <p className="mt-1 text-sm text-blue-100">
                    {primary.role.domain} · {primary.matchCategory} · {primary.coverage.matched} of{' '}
                    {primary.coverage.total} skills matched
                  </p>
                </div>
                <p className="text-5xl font-extrabold tracking-tight">{primary.matchScore}%</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white/10 p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                    Key strengths
                  </p>
                  {primary.strengths.length === 0 ? (
                    <p className="mt-1 text-sm text-blue-100">None yet — keep building.</p>
                  ) : (
                    <ul className="mt-1.5 space-y-1 text-sm font-medium">
                      {primary.strengths.map((s) => (
                        <li key={s.skillId}>· {s.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="rounded-xl bg-white/10 p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-200">
                    Priority development
                  </p>
                  {primary.developmentAreas.length === 0 ? (
                    <p className="mt-1 text-sm text-blue-100">No gaps — fully covered.</p>
                  ) : (
                    <ul className="mt-1.5 space-y-1 text-sm font-medium">
                      {primary.developmentAreas.map((s) => (
                        <li key={s.skillId}>· {s.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* SECTION 4 — Ranked role results */}
          <section aria-label="Ranked role results">
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Ranked roles{' '}
              <span className="font-normal text-slate-400">· ordered by match score, highest first</span>
            </p>
            <div className="grid gap-3">
              {results.map((result, index) => {
                const active = result.role.id === selected?.role.id
                return (
                  <button
                    key={result.role.id}
                    type="button"
                    onClick={() => setSelectedId(result.role.id)}
                    aria-pressed={active}
                    className={cn(
                      'rounded-2xl border bg-white p-4 text-left transition sm:p-5',
                      active
                        ? 'border-blue-500 shadow-[0_12px_40px_-12px_rgba(37,99,235,0.35)] ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                            index === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500',
                          )}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-[15px] font-semibold text-slate-900">{result.role.name}</p>
                          <p className="text-xs text-slate-400">
                            {result.role.domain} · {result.coverage.matched} matched ·{' '}
                            {result.coverage.criticalMissing} critical missing
                          </p>
                        </div>
                      </div>
                      <Badge tone={CATEGORY_TONES[result.matchCategory]}>{result.matchCategory}</Badge>
                    </div>
                    <div className="mt-3">
                      <ScoreBar score={result.matchScore} />
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* SECTION 6 — Match explanation for the selected role */}
          {selected ? (
            <Card>
              <CardHeader
                title={`Why ${selected.role.name}: ${selected.matchScore}%`}
                subtitle={`${selected.matchCategory} · critical penalty ×${selected.criticalPenalty} (${selected.coverage.criticalMatched}/${selected.coverage.criticalTotal} critical skills present)`}
                action={
                  <Link
                    to={`/skill-gap?role=${selected.role.id}`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-blue-600 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-blue-700"
                  >
                    View Skill Gaps <ArrowRight size={14} />
                  </Link>
                }
              />
              <CardBody className="grid gap-4 md:grid-cols-2">
                <MatchGroup
                  icon={CircleCheck}
                  tone="text-emerald-600"
                  title={`Matched skills (${selected.matchedSkills.length})`}
                  subtitle="Meets or exceeds the required level"
                  items={selected.matchedSkills}
                  emptyText="None yet."
                />
                <MatchGroup
                  icon={CircleDashed}
                  tone="text-blue-600"
                  title={`Partial matches (${selected.partialMatches.length})`}
                  subtitle="Present but below the required level"
                  items={selected.partialMatches}
                  emptyText="None — every skill held meets its bar, or is missing."
                />
                <MatchGroup
                  icon={CircleX}
                  tone="text-slate-400"
                  title={`Missing skills (${selected.missingSkills.length})`}
                  subtitle="Not currently in the student profile"
                  items={selected.missingSkills}
                  emptyText="Nothing missing."
                />
                <MatchGroup
                  icon={TriangleAlert}
                  tone="text-amber-600"
                  title={`Critical gaps (${selected.criticalSkillsMissing.length})`}
                  subtitle="Missing critical requirements drag the score down"
                  items={selected.criticalSkillsMissing}
                  emptyText="No critical gaps."
                />
              </CardBody>
            </Card>
          ) : null}
        </>
      )}
    </div>
  )
}

function MatchGroup({ icon: Icon, tone, title, subtitle, items, emptyText }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <p className={cn('flex items-center gap-1.5 text-sm font-semibold text-slate-900')}>
        <Icon size={16} className={tone} /> {title}
      </p>
      <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">{emptyText}</p>
      ) : (
        <ul className="mt-2.5 space-y-1.5">
          {items.map((item) => (
            <li
              key={item.skillId}
              className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-[13px] shadow-sm"
            >
              <span className="font-medium text-slate-700">{item.name}</span>
              <span className="shrink-0 text-xs font-semibold text-slate-400">
                {item.studentLevel > 0
                  ? `L${item.studentLevel} / req L${item.requiredLevel}`
                  : `requires L${item.requiredLevel}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
