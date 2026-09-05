import { useMemo, useState } from 'react'
import { Building2, ThumbsUp, ThumbsDown, MinusCircle, PlusCircle } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../../components/shared/Card'
import { PageHeader, Badge } from '../../components/shared/ui'
import { cn } from '../../utils/cn'
import { getAllRoles, getRoleIntelligence, REQUIREMENT_LEVEL_LABELS } from '../../services/industryIntelligence'
import { DEMO_EMPLOYER } from '../../data/stakeholders/demoIdentities'
import {
  loadEmployerFeedback,
  setSkillRelevance,
  setBaselineFeedback,
  proposeEmergingSkill,
  RELEVANCE_OPTIONS,
  BASELINE_OPTIONS,
} from '../../services/employerValidation'

const RELEVANCE_META = {
  relevant: { label: 'Relevant', icon: ThumbsUp, active: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  'needs-review': { label: 'Needs Review', icon: MinusCircle, active: 'border-amber-500 bg-amber-50 text-amber-700' },
  'not-relevant': { label: 'Not Relevant', icon: ThumbsDown, active: 'border-slate-400 bg-slate-100 text-slate-600' },
}

const BASELINE_META = {
  'too-low': { label: 'Too Low', active: 'border-amber-500 bg-amber-50 text-amber-700' },
  appropriate: { label: 'Appropriate', active: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  'too-high': { label: 'Too High', active: 'border-slate-400 bg-slate-100 text-slate-600' },
}

function TriState({ options, meta, value, onPick }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const m = meta[opt]
        const Icon = m.icon
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onPick(opt)}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
              active ? m.active : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600',
            )}
          >
            {Icon ? <Icon size={13} /> : null}
            {m.label}
          </button>
        )
      })}
    </div>
  )
}

export function EmployerPage() {
  const roles = useMemo(() => getAllRoles(), [])
  const [roleId, setRoleId] = useState(roles[0]?.id)
  const [feedback, setFeedback] = useState(loadEmployerFeedback)
  const [draftName, setDraftName] = useState('')
  const [draftRationale, setDraftRationale] = useState('')

  const intel = useMemo(() => getRoleIntelligence(roleId), [roleId])
  const relCount = Object.keys(feedback.relevance[roleId] ?? {}).length
  const baseCount = Object.keys(feedback.baselines[roleId] ?? {}).length

  const submitEmerging = () => {
    if (!draftName.trim()) return
    setFeedback(proposeEmergingSkill(feedback, { name: draftName, relatedRoleId: roleId, rationale: draftRationale }))
    setDraftName('')
    setDraftRationale('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employer Portal"
        title="Industry Validation"
        description={`${DEMO_EMPLOYER.name} reviews role-to-skill mappings. Feedback is stored separately — canonical industry data is never modified.`}
        actions={<Badge tone="violet">Demo employer · local state</Badge>}
      />

      {/* Role review selector */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Role review selection">
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={r.id === roleId}
            onClick={() => setRoleId(r.id)}
            className={cn(
              'rounded-full border px-4 py-2 text-[13px] font-medium transition-colors',
              r.id === roleId
                ? 'border-blue-600 bg-blue-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
            )}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Role + validation */}
      <Card>
        <CardHeader
          title={`${intel?.role.name ?? ''} — skill relevance review`}
          subtitle={intel?.role.description ?? ''}
          action={<Badge tone="blue">{relCount} relevance · {baseCount} baseline reviews</Badge>}
        />
        <CardBody className="space-y-3">
          {intel?.skills.map((s) => (
            <div key={s.skillId} className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  {s.skill.name}
                  <span className="ml-2 font-normal text-slate-400">
                    importance {Math.round(s.importance * 100)}% · expected {REQUIREMENT_LEVEL_LABELS[s.requiredLevel]}
                  </span>
                </p>
                <Badge tone="slate">{s.requirementCategory}</Badge>
              </div>
              <div className="mt-2.5 grid gap-2 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Relevance</p>
                  <TriState
                    options={RELEVANCE_OPTIONS}
                    meta={RELEVANCE_META}
                    value={feedback.relevance[roleId]?.[s.skillId]}
                    onPick={(v) => setFeedback(setSkillRelevance(feedback, roleId, s.skillId, v))}
                  />
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Baseline expectation</p>
                  <TriState
                    options={BASELINE_OPTIONS}
                    meta={BASELINE_META}
                    value={feedback.baselines[roleId]?.[s.skillId]}
                    onPick={(v) => setFeedback(setBaselineFeedback(feedback, roleId, s.skillId, v))}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Emerging skills */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Propose emerging skill" subtitle="Suggestions stay pending — never auto-enter the canonical catalog" />
          <CardBody className="space-y-2.5">
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Skill name, e.g. Prompt Engineering"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
            />
            <textarea
              value={draftRationale}
              onChange={(e) => setDraftRationale(e.target.value)}
              placeholder="Why is this emerging for this role? (optional)"
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={submitEmerging}
              disabled={!draftName.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PlusCircle size={15} /> Submit for validation
            </button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Validation queue"
            subtitle="Employer proposals awaiting review"
            action={<Badge tone="amber">{feedback.emerging.length} pending</Badge>}
          />
          <CardBody className="space-y-2">
            {feedback.emerging.length === 0 ? (
              <p className="text-sm text-slate-400">No proposals yet. Submitted skills will appear here as Pending Validation.</p>
            ) : (
              [...feedback.emerging].reverse().map((e) => (
                <div key={e.id} className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{e.name}</p>
                    <Badge tone="amber">Pending Validation</Badge>
                  </div>
                  {e.rationale ? <p className="mt-1 text-[13px] text-slate-500">{e.rationale}</p> : null}
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <Building2 size={13} /> Demo employer identity; validation persists in this browser only and never alters canonical role data.
      </p>
    </div>
  )
}
