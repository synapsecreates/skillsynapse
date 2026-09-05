import { useMemo, useState } from 'react'
import { MapPinned } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../../components/shared/Card'
import { PageHeader, Badge } from '../../components/shared/ui'
import { cn } from '../../utils/cn'
import { DEMO_COHORT } from '../../data/stakeholders/demoCohort'
import { DEMO_DISTRICTS } from '../../data/stakeholders/demoIdentities'
import { DEMAND_DATA_STATUS } from '../../data/stakeholders/districtDemand'
import {
  filterCohort,
  districtOverview,
  generatePlanningRecommendations,
  SUPPLY_THRESHOLD,
} from '../../services/stakeholderAggregation'

const STATUS_TONES = { 'HIGH DEFICIT': 'amber', DEFICIT: 'blue', BALANCED: 'emerald', SURPLUS: 'violet' }

function Meter({ value, tone }) {
  return (
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
      <div
        className={cn(
          'h-full rounded-full',
          tone === 'supply' ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-violet-500',
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function DistrictPage() {
  const [districtId, setDistrictId] = useState(DEMO_DISTRICTS[0].id)

  const students = useMemo(() => filterCohort(DEMO_COHORT, { districtId }), [districtId])
  const overview = useMemo(() => districtOverview(students, districtId), [students, districtId])
  const recs = useMemo(() => generatePlanningRecommendations(overview), [overview])
  const district = DEMO_DISTRICTS.find((d) => d.id === districtId)
  const focusRows = useMemo(
    () => overview.rows.filter((r) => r.status !== 'BALANCED').slice(0, 14),
    [overview],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="District / Government Portal"
        title="District Skill Intelligence"
        description={`Student skill supply vs mapped industry demand for ${district?.name ?? ''} — deterministic aggregation over demo student records and the district demand scenario.`}
        actions={<Badge tone="violet">MVP mapped demand scenario</Badge>}
      />

      {/* District switcher */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="District selection">
        {DEMO_DISTRICTS.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={d.id === districtId}
            onClick={() => setDistrictId(d.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors',
              d.id === districtId
                ? 'border-blue-600 bg-blue-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
            )}
          >
            <MapPinned size={14} /> {d.name}
          </button>
        ))}
      </div>

      {/* Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Students analyzed', value: overview.studentCount },
          { label: 'Top skill deficit', value: overview.topDeficit?.name ?? '—' },
          { label: 'Top skill surplus', value: overview.topSurplus?.name ?? '—' },
          { label: 'Priority training area', value: overview.priorityTraining?.name ?? '—' },
          { label: 'Demand/supply alignment', value: `${overview.alignment}%` },
        ].map((m) => (
          <Card key={m.label}>
            <CardBody>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{m.label}</p>
              <p className="mt-1 truncate text-2xl font-bold text-slate-900">{m.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Supply vs industry demand */}
      <Card>
        <CardHeader
          title="Student skill supply vs industry demand"
          subtitle={`Supply = % of students at level ${SUPPLY_THRESHOLD}+ · Industry demand = district scenario × role importance (0–100) · deficit = demand − supply`}
        />
        <CardBody className="space-y-3">
          {focusRows.map((r) => (
            <div key={r.skillId} className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  {r.name} <span className="font-normal text-slate-400">· {r.category}</span>
                </p>
                <Badge tone={STATUS_TONES[r.status]}>{r.status}</Badge>
              </div>
              <div className="mt-2.5 space-y-1.5 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0">Supply {r.supply}%</span>
                  <Meter value={r.supply} tone="supply" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0">Demand {r.demand}%</span>
                  <Meter value={r.demand} tone="demand" />
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Industry demand (scenario level {r.demandLevel}/5) · student supply at level {SUPPLY_THRESHOLD}+
              </p>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Student career aspirations — separate insight, not demand */}
      <Card>
        <CardHeader
          title="Student career aspirations"
          subtitle="Target-role distribution: what students want to pursue — not a measure of industry demand"
        />
        <CardBody className="space-y-2.5">
          {(overview.aspirations ?? []).map((a) => (
            <div key={a.roleId} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-[13px] font-medium text-slate-700">
                {a.roleName}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-600"
                  style={{ width: `${Math.min(100, Math.max(0, a.pct))}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-[13px] font-bold text-slate-800">
                {a.count} · {a.pct}%
              </span>
            </div>
          ))}
          {(overview.aspirations ?? []).length === 0 ? (
            <p className="text-sm text-slate-400">No aspiration data in this slice.</p>
          ) : null}
        </CardBody>
      </Card>

      {/* Planning recommendations */}
      <Card>
        <CardHeader title="Planning recommendations" subtitle="Generated from district deficits, surpluses and severity" />
        <CardBody className="space-y-2.5">
          {recs.map((r) => (
            <p
              key={r.skillId + r.kind}
              className={cn(
                'rounded-xl border px-4 py-2.5 text-sm leading-relaxed',
                r.kind === 'surplus'
                  ? 'border-violet-100 bg-violet-50/50 text-slate-600'
                  : 'border-amber-100 bg-amber-50/60 text-slate-700',
              )}
            >
              {r.text}
            </p>
          ))}
          {recs.length === 0 ? <p className="text-sm text-slate-400">No recommendations for this district slice.</p> : null}
        </CardBody>
      </Card>

      <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
        <span className="font-semibold text-slate-600">How to read this page: </span>
        Industry demand comes from the {DEMAND_DATA_STATUS.toLowerCase()} for this district,
        blended with mapped role-requirement importance — it is independent of what students
        aspire to. Supply reflects actual student competency (level {SUPPLY_THRESHOLD}+).
        Student career aspirations are shown separately as context, not as demand.
      </p>
    </div>
  )
}
