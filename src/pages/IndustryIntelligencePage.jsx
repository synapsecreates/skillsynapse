import { useMemo, useState } from 'react'
import {
  Monitor,
  Server,
  Layers,
  Database,
  Brain,
  Cpu,
  BookMarked,
  Map,
  ArrowLeftRight,
  BarChart3,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/shared/Card'
import { PageHeader, Badge } from '../components/shared/ui'
import { cn } from '../utils/cn'
import {
  getAllRoles,
  getRoleIntelligence,
  REQUIREMENT_LEVEL_LABELS,
  REQUIREMENT_CATEGORY_ORDER,
} from '../services/industryIntelligence'
import {
  INTELLIGENCE_METHODOLOGY,
  REQUIREMENT_FIELD_DOCS,
} from '../data/intelligence/methodology'

const ROLE_ICONS = {
  frontend_developer: Monitor,
  backend_developer: Server,
  full_stack_developer: Layers,
  data_analyst: Database,
  data_scientist: Brain,
  ai_ml_engineer: Cpu,
}

const CATEGORY_TONES = {
  critical: 'amber',
  core: 'blue',
  supporting: 'violet',
  complementary: 'slate',
}

const PIPELINE_STEPS = [
  { icon: BookMarked, title: 'Occupation Sources', caption: 'ESCO · O*NET framework references' },
  { icon: Map, title: 'Occupation Mapping', caption: 'Roles aligned to standards' },
  { icon: ArrowLeftRight, title: 'Skill Normalization', caption: 'Aliases → canonical IDs' },
  { icon: BarChart3, title: 'Role-Skill Analysis', caption: 'Importance · level · category' },
  { icon: Sparkles, title: 'Unified Intelligence', caption: 'One profile per role' },
]

function LevelDots({ level }) {
  return (
    <span className="flex items-center gap-1" aria-label={`Level ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={cn(
            'h-1.5 w-4 rounded-full',
            n <= level ? 'bg-blue-600' : 'bg-slate-200',
          )}
        />
      ))}
    </span>
  )
}

export function IndustryIntelligencePage() {
  const roles = useMemo(() => getAllRoles(), [])
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id)
  const intelligence = useMemo(() => getRoleIntelligence(selectedRoleId), [selectedRoleId])

  if (!intelligence) return null
  const { role, sources, skills, summary } = intelligence

  return (
    <div className="space-y-6">
      {/* SECTION 1 — Header */}
      <PageHeader
        eyebrow="Industry Data"
        title="Industry Intelligence"
        description="Explore how SkillSynapse structures standardized occupational intelligence into role-specific skill requirements."
        actions={<Badge tone="blue">Local MVP dataset</Badge>}
      />

      {/* SECTION 2 — Role selection */}
      <section aria-label="Role selection">
        <p className="mb-3 text-sm font-semibold text-slate-700">
          Select a role <span className="font-normal text-slate-400">· {roles.length} unified profiles</span>
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => {
            const Icon = ROLE_ICONS[r.id] ?? Layers
            const active = r.id === selectedRoleId
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRoleId(r.id)}
                aria-pressed={active}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border p-4 text-left transition',
                  active
                    ? 'border-blue-600 bg-blue-600 text-white shadow-[0_12px_40px_-12px_rgba(37,99,235,0.55)]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    active ? 'bg-white/15 text-white' : 'bg-blue-50 text-blue-600',
                  )}
                >
                  <Icon size={19} />
                </span>
                <span className="min-w-0">
                  <span className={cn('block truncate text-[15px] font-semibold', active ? 'text-white' : 'text-slate-900')}>
                    {r.name}
                  </span>
                  <span className={cn('block text-xs', active ? 'text-blue-100' : 'text-slate-400')}>
                    {r.domain} · {r.skills.length} skills
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* SECTION 3 — Pipeline visualization */}
      <Card>
        <CardHeader
          title="Intelligence pipeline"
          subtitle="How standardized occupation sources become a unified role profile"
        />
        <CardBody>
          <ol className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
            {PIPELINE_STEPS.map((step, i) => (
              <PipelineStep key={step.title} step={step} index={i} last={i === PIPELINE_STEPS.length - 1} />
            ))}
          </ol>
        </CardBody>
      </Card>

      {/* METHODOLOGY — collapsible provenance explainer */}
      <Card>
        <CardBody>
          <details>
            <summary className="cursor-pointer text-[15px] font-semibold text-slate-900 marker:text-blue-600">
              {INTELLIGENCE_METHODOLOGY.headline}
              <span className="ml-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                {INTELLIGENCE_METHODOLOGY.datasetStatus}
              </span>
            </summary>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
              <p>{INTELLIGENCE_METHODOLOGY.summary}</p>
              <div>
                <p className="font-semibold text-slate-800">What the MVP uses</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {INTELLIGENCE_METHODOLOGY.dataUsed.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-800">What the weights mean</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {Object.values(REQUIREMENT_FIELD_DOCS).map((doc) => (
                    <li key={doc.label}>
                      <span className="font-medium text-slate-700">{doc.label} ({doc.range}): </span>
                      {doc.meaning}
                    </li>
                  ))}
                </ul>
              </div>
              <p>{INTELLIGENCE_METHODOLOGY.weightingUse}</p>
              <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-[13px] text-slate-500">
                {INTELLIGENCE_METHODOLOGY.staticNote}
              </p>
            </div>
          </details>
        </CardBody>
      </Card>

      {/* SECTION 4 — Source intelligence */}
      <section aria-label="Source intelligence">
        <p className="mb-3 text-sm font-semibold text-slate-700">
          Source intelligence <span className="font-normal text-slate-400">· standardized occupation references</span>
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {sources.map(({ source, mapping }) => (
            <Card key={source.id}>
              <CardHeader
                title={source.name}
                subtitle={source.fullName}
                action={<Badge tone="slate">Source Mapping</Badge>}
              />
              <CardBody className="space-y-2 text-sm leading-relaxed text-slate-500">
                <p>{source.description}</p>
                <p>
                  <span className="font-semibold text-slate-700">Mapped to: </span>
                  {mapping.mappedOccupation ?? 'Not mapped in this MVP'}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Used for: </span>
                  {source.roleInSynapse}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
        <div className="mt-3 flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-violet-600" />
          <p className="text-sm leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-900">SkillSynapse Unified Intelligence — </span>
            the profile below is a local synthesis of these source mappings, not a live feed from
            ESCO or O*NET. Values are structured MVP parameters.
          </p>
        </div>
      </section>

      {/* SECTION 5 — Unified role profile */}
      <Card>
        <CardHeader
          title={role.name}
          subtitle={role.description}
          action={<Badge tone="violet">Unified SkillSynapse Profile</Badge>}
        />
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Domain', value: role.domain },
              { label: 'Mapped skills', value: String(summary.counts.total) },
              { label: 'Mapping coverage', value: summary.coverage },
              { label: 'Competency focus', value: role.primaryFocus },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{stat.label}</p>
                <p className="mt-1 text-[15px] font-semibold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* SECTION 6 — Skill intelligence visualization */}
      <Card>
        <CardHeader
          title="Skill intelligence"
          subtitle={`All ${skills.length} required skills for ${role.name}`}
          action={<Badge tone="blue">{summary.counts.critical + summary.counts.core} critical / core</Badge>}
        />
        <CardBody className="space-y-3">
          {skills.map((item) => (
            <div key={item.skillId} className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.skill.name}</p>
                  <p className="text-xs text-slate-400">{item.skill.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={CATEGORY_TONES[item.requirementCategory]}>
                    {item.requirementCategory}
                  </Badge>
                  <span className="text-xs font-medium text-slate-500">
                    Level {item.requiredLevel} · {REQUIREMENT_LEVEL_LABELS[item.requiredLevel]}
                  </span>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200/70" role="img" aria-label={`${item.skill.name} importance ${Math.round(item.importance * 100)} percent`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                    style={{ width: `${Math.round(item.importance * 100)}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-semibold text-slate-600">
                  {Math.round(item.importance * 100)}%
                </span>
                <LevelDots level={item.requiredLevel} />
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* SECTION 7 — Priority groups */}
      <section aria-label="Skill priority groups">
        <p className="mb-3 text-sm font-semibold text-slate-700">
          Skill priority groups <span className="font-normal text-slate-400">· updates with the selected role</span>
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REQUIREMENT_CATEGORY_ORDER.map((category) => {
            const group = summary[`${category}Skills`] ?? []
            return (
              <Card key={category}>
                <CardHeader
                  title={`${category[0].toUpperCase()}${category.slice(1)}`}
                  subtitle={`${group.length} skill${group.length === 1 ? '' : 's'}`}
                  action={<Badge tone={CATEGORY_TONES[category]}>{group.length}</Badge>}
                />
                <CardBody>
                  {group.length === 0 ? (
                    <p className="text-sm text-slate-400">None for this role.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {group.map((item) => (
                        <li
                          key={item.skillId}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-[13px]"
                        >
                          <span className="font-medium text-slate-700">{item.skill.name}</span>
                          <span className="text-xs font-semibold text-slate-400">
                            {Math.round(item.importance * 100)}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>
            )
          })}
        </div>
      </section>

      {/* SECTION 8 — Intelligence summary */}
      <Card className="border-blue-100 bg-gradient-to-br from-blue-50/60 to-violet-50/60">
        <CardBody>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
            Intelligence summary
          </p>
          <p className="mt-2 text-[15px] font-semibold text-slate-900">
            For {role.name}: {summary.counts.critical} Critical · {summary.counts.core} Core ·{' '}
            {summary.counts.supporting} Supporting · {summary.counts.complementary} Complementary
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Primary Competency Focus: <span className="font-semibold">{summary.primaryFocus}</span>.
            Highest-importance skills:{' '}
            {summary.topSkills.map((s) => s.skill.name).join(', ')} — mapping coverage
            rated “{summary.coverage}” (coarse band over curated MVP weights, not a measured statistic).
          </p>
        </CardBody>
      </Card>
    </div>
  )
}

function PipelineStep({ step, index, last }) {
  return (
    <>
      <li className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
          <step.icon size={17} />
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold text-slate-900">
            {index + 1}. {step.title}
          </span>
          <span className="block truncate text-xs text-slate-400">{step.caption}</span>
        </span>
      </li>
      {!last ? (
        <li aria-hidden className="flex items-center justify-center">
          <ChevronRight size={16} className="rotate-90 text-slate-300 md:rotate-0" />
        </li>
      ) : null}
    </>
  )
}
