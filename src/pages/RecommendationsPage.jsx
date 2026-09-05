import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ListChecks,
  ArrowRight,
  Trophy,
  Sparkles,
  BookOpen,
  Wrench,
  Dumbbell,
  Compass,
} from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/shared/Card'
import { PageHeader, Badge, EmptyState } from '../components/shared/ui'
import { cn } from '../utils/cn'
import { loadProfile } from '../services/profileStorage'
import { adaptStudentProfile } from '../services/studentProfileAdapter'
import { getAllRoles, getRoleById } from '../services/industryIntelligence'
import { matchAllRoles } from '../services/roleMatching'
import { analyzeSkillGaps } from '../services/skillGapAnalysis'
import { generateRecommendations } from '../services/recommendationEngine'

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

const TYPE_ICONS = {
  learn: BookOpen,
  develop: Wrench,
  strengthen: Dumbbell,
  advance: Compass,
}

export function RecommendationsPage() {
  // Same role context as Skill Gap Analysis: ?role= deep link, else strongest match.
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

  const result = useMemo(() => {
    const gaps = analyzeSkillGaps(adapted.skills, selectedRole)
    return generateRecommendations(gaps)
  }, [adapted.skills, selectedRole])

  const selectRole = (id) => {
    setSelectedId(id)
    setSearchParams({ role: id }, { replace: true })
  }

  const hasSkills = adapted.skills.length > 0
  const { summary } = result
  const ready = hasSkills && summary.totalRecommendations === 0

  return (
    <div className="space-y-6">
      {/* SECTION 1 — Header */}
      <PageHeader
        eyebrow="Intelligence"
        title="Your Development Recommendations"
        description="Prioritized actions based on your current skills and the requirements of your target role."
        actions={
          <>
            <Badge tone={hasSkills ? 'blue' : 'slate'}>
              {summary.totalRecommendations} action{summary.totalRecommendations === 1 ? '' : 's'}
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

      {/* SECTION 2 — Target role */}
      <section aria-label="Target role selection">
        <p className="mb-3 text-sm font-semibold text-slate-700">
          Target role{' '}
          <span className="font-normal text-slate-400">
            · shared with Skill Gap Analysis, switch freely
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
            icon={ListChecks}
            title="Add skills to get recommendations"
            description="Add skills to your Student Profile to receive personalized development recommendations for any target role."
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
      ) : ready ? (
        <Card className="border-emerald-200 bg-emerald-50/60">
          <CardBody className="flex items-start gap-3">
            <Trophy size={20} className="mt-0.5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-[15px] font-semibold text-slate-900">
                You meet the mapped requirements for {selectedRole.name} 🎉
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                No urgent development actions — switch target roles or explore optional
                advancement below.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* SECTION 3 — Development summary */}
          <Card>
            <CardHeader
              title={`Development summary · ${selectedRole.name}`}
              subtitle={selectedRole.description}
              action={
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone="violet">{selectedRole.domain}</Badge>
                  <Link
                    to={`/report?role=${selectedRole.id}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-slate-700"
                  >
                    Generate Career Report <ArrowRight size={14} />
                  </Link>
                </div>
              }
            />
            <CardBody>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  { label: 'Total actions', value: summary.totalRecommendations },
                  { label: 'Highest priority', value: summary.highestPriorityCount },
                  { label: 'To learn', value: summary.learnCount },
                  { label: 'To strengthen', value: summary.developCount + summary.strengthenCount },
                  { label: 'Optional', value: summary.optionalCount },
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

          {/* SECTION 4 — Primary focus */}
          <section aria-label="Primary focus">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <Trophy size={15} className="text-slate-400" /> Primary focus{' '}
              <span className="font-normal text-slate-400">· top 3 highest-priority actions</span>
            </p>
            <div className="grid gap-4 lg:grid-cols-3">
              {result.primaryFocus.map((rec, index) => (
                <RecommendationCard key={rec.skillId} rec={rec} rank={index + 1} featured />
              ))}
            </div>
          </section>

          {/* SECTION 5 — Additional development areas */}
          {result.additionalAreas.length > 0 ? (
            <section aria-label="Additional development areas">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Additional development areas{' '}
                <span className="font-normal text-slate-400">· remaining actions by priority</span>
              </p>
              <div className="grid gap-3">
                {result.additionalAreas.map((rec, index) => (
                  <RecommendationRow key={rec.skillId} rec={rec} rank={result.primaryFocus.length + index + 1} />
                ))}
              </div>
            </section>
          ) : null}

          {/* SECTION 6 — Optional advancement */}
          {result.optionalAdvancements.length > 0 ? (
            <Card>
              <CardHeader
                title={`Optional advancement (${result.optionalAdvancements.length})`}
                subtitle="Complementary extras — an additional advantage, not urgent"
                action={
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Sparkles size={19} />
                  </span>
                }
              />
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  {result.optionalAdvancements.map((rec) => (
                    <span key={rec.skillId} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-500">
                      {rec.skillName}
                      <span className="text-[11px] text-slate-400">· {rec.action}</span>
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

function RecBadges({ rec }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone={PRIORITY_TONES[rec.priorityLabel]}>{rec.priorityLabel}</Badge>
      <Badge tone={CATEGORY_TONES[rec.requirementCategory]}>{rec.requirementCategory}</Badge>
    </div>
  )
}

function LevelGrid({ rec }) {
  return (
    <div className="grid gap-2 text-sm sm:grid-cols-3">
      <div className="rounded-lg bg-slate-50 px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current</p>
        <p className="font-semibold text-slate-700">{rec.studentLevelLabel}</p>
      </div>
      <div className="rounded-lg bg-slate-50 px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Target</p>
        <p className="font-semibold text-slate-700">{rec.requiredLevelLabel}</p>
      </div>
      <div className="rounded-lg bg-slate-50 px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Action</p>
        <p className="font-semibold text-blue-700">{rec.action}</p>
      </div>
    </div>
  )
}

function RecommendationCard({ rec, rank, featured }) {
  const Icon = TYPE_ICONS[rec.recommendationType] ?? ListChecks
  return (
    <div
      className={cn(
        'rounded-2xl border bg-white p-5',
        featured
          ? 'border-blue-200 shadow-[0_12px_40px_-12px_rgba(37,99,235,0.35)]'
          : 'border-slate-200',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Icon size={19} />
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-[13px] font-bold text-white">
          {rank}
        </span>
      </div>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-600">
        {rec.priorityLabel}
      </p>
      <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900">{rec.skillName}</h3>
      <p className="text-sm font-semibold text-slate-600">{rec.title}</p>
      <div className="mt-3">
        <RecBadges rec={rec} />
      </div>
      <div className="mt-3">
        <LevelGrid rec={rec} />
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-slate-500">
        <span className="font-semibold text-slate-700">Why this matters: </span>
        {rec.explanation}
      </p>
    </div>
  )
}

function RecommendationRow({ rec, rank }) {
  const Icon = TYPE_ICONS[rec.recommendationType] ?? ListChecks
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            {rank}
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon size={17} />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-slate-900">{rec.skillName}</p>
            <p className="text-xs text-slate-400">
              {rec.title} · {rec.studentLevelLabel} → {rec.requiredLevelLabel}
            </p>
          </div>
        </div>
        <RecBadges rec={rec} />
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-slate-500">
        <span className="font-semibold text-slate-700">Why this matters: </span>
        {rec.explanation}
      </p>
    </div>
  )
}
