import { useMemo, useState } from 'react'
import { Landmark, BookOpenCheck, FlaskConical } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../../components/shared/Card'
import { PageHeader, Badge } from '../../components/shared/ui'
import { cn } from '../../utils/cn'
import { DEMO_COHORT } from '../../data/stakeholders/demoCohort'
import { DEMO_CURRICULUM } from '../../data/stakeholders/demoCurriculum'
import { DEMO_INSTITUTIONS, DEMO_PROGRAMS } from '../../data/stakeholders/demoIdentities'
import {
  filterCohort,
  aggregateInstitution,
  buildHeatmap,
  gapBand,
  generateCurriculumRecommendations,
  assessCurriculum,
} from '../../services/stakeholderAggregation'

const STATUS_TONES = { ALIGNED: 'emerald', 'AT RISK': 'amber', OBSOLETE: 'slate' }

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}

export function InstitutionPage() {
  const [institutionId, setInstitutionId] = useState(DEMO_INSTITUTIONS[0].id)
  const [program, setProgram] = useState('All')
  const [academicYear, setAcademicYear] = useState('All')
  const [heatDim, setHeatDim] = useState('program')

  const filtered = useMemo(
    () => filterCohort(DEMO_COHORT, {
      institutionId,
      program: program === 'All' ? null : program,
      academicYear: academicYear === 'All' ? null : Number(academicYear),
    }),
    [institutionId, program, academicYear],
  )
  const agg = useMemo(() => aggregateInstitution(filtered), [filtered])
  const heat = useMemo(() => buildHeatmap(filtered, heatDim), [filtered, heatDim])
  const recs = useMemo(() => generateCurriculumRecommendations(agg.topGaps), [agg])
  const courses = useMemo(() => assessCurriculum(DEMO_CURRICULUM), [])

  const institution = DEMO_INSTITUTIONS.find((i) => i.id === institutionId)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Institutional Portal"
        title="Curriculum Alignment Dashboard"
        description={`Cohort-level skill gaps for ${institution?.name ?? ''}, aggregated deterministically from demo student records.`}
        actions={<Badge tone="violet">Demo cohort · {DEMO_COHORT.length} students</Badge>}
      />

      {/* Filters */}
      <Card>
        <CardBody className="flex flex-wrap items-end gap-3">
          <FilterSelect
            label="Institution"
            value={institutionId}
            onChange={(v) => { setInstitutionId(v); setProgram('All') }}
            options={DEMO_INSTITUTIONS.map((i) => ({ value: i.id, label: i.name }))}
          />
          <FilterSelect
            label="Program"
            value={program}
            onChange={setProgram}
            options={[{ value: 'All', label: 'All programs' }, ...DEMO_PROGRAMS.map((p) => ({ value: p, label: p }))]}
          />
          <FilterSelect
            label="Academic year"
            value={academicYear}
            onChange={setAcademicYear}
            options={[{ value: 'All', label: 'All years' }, '1', '2', '3', '4'].map((y) => ({ value: y, label: y === 'All' ? y : `Year ${y}` }))}
          />
        </CardBody>
      </Card>

      {/* Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Students analyzed', value: agg.studentCount },
          { label: 'Avg readiness', value: `${agg.readinessAvg}%` },
          { label: 'Avg role alignment', value: `${agg.alignmentAvg}%` },
          { label: 'Major curriculum gaps', value: agg.majorGapCount },
          { label: 'Most demanded missing skill', value: agg.topMissingSkill?.name ?? '—' },
        ].map((m) => (
          <Card key={m.label}>
            <CardBody>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{m.label}</p>
              <p className="mt-1 truncate text-2xl font-bold text-slate-900">{m.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader
          title="Curriculum gap heatmap"
          subtitle="Aggregated gap severity per skill across programs or years — derived from student gaps, not hand-written"
          action={
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              {['program', 'academicYear'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setHeatDim(d)}
                  className={cn(
                    'rounded-lg px-3 py-1.5',
                    heatDim === d ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400',
                  )}
                >
                  {d === 'program' ? 'By program' : 'By year'}
                </button>
              ))}
            </div>
          }
        />
        <CardBody className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left text-xs font-semibold text-slate-400">Skill</th>
                {heat.cols.map((c) => (
                  <th key={c.id} className="p-2 text-center text-xs font-semibold text-slate-400">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heat.rows.map((row) => (
                <tr key={row.skillId} className="border-t border-slate-100">
                  <td className="p-2 font-medium text-slate-700">{row.name}</td>
                  {heat.cols.map((c) => {
                    const sev = heat.cells[row.skillId]?.[c.id]
                    const band = gapBand(sev)
                    return (
                      <td key={c.id} className="p-1.5 text-center">
                        <span
                          className={cn(
                            'inline-block min-w-[92px] rounded-lg px-2 py-1.5 text-xs font-semibold',
                            band.tone === 'amber' && 'bg-amber-100 text-amber-800',
                            band.tone === 'blue' && 'bg-blue-50 text-blue-700',
                            band.tone === 'emerald' && 'bg-emerald-50 text-emerald-700',
                            band.tone === 'slate' && 'bg-slate-50 text-slate-300',
                          )}
                        >
                          {sev == null ? '—' : `${band.label} · ${Math.round(sev * 100)}%`}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Top gaps + recommendations */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Top curriculum gaps" subtitle="Highest aggregated skill deficits in the filtered cohort" />
          <CardBody className="space-y-2">
            {agg.topGaps.map((g, i) => (
              <div key={g.skillId} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-2.5">
                <p className="text-sm font-medium text-slate-700">
                  <span className="mr-2 font-bold text-slate-400">{i + 1}</span>{g.name}
                </p>
                <p className="shrink-0 text-xs font-semibold text-slate-500">
                  {g.affectedPct}% affected · severity {Math.round(g.avgSeverity * 100)}%
                </p>
              </div>
            ))}
            {agg.topGaps.length === 0 ? <p className="text-sm text-slate-400">No gaps in this slice.</p> : null}
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Curriculum recommendations"
            subtitle="Deterministic templates from aggregated gaps + industry demand"
            action={<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><BookOpenCheck size={19} /></span>}
          />
          <CardBody className="space-y-2.5">
            {recs.map((r) => (
              <p key={r.skillId} className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-2.5 text-sm leading-relaxed text-slate-600">
                {r.text}
              </p>
            ))}
            {recs.length === 0 ? <p className="text-sm text-slate-400">Nothing to recommend for this slice.</p> : null}
          </CardBody>
        </Card>
      </div>

      {/* Course obsolescence tracker */}
      <Card>
        <CardHeader
          title="Course obsolescence tracker"
          subtitle="Taught skills vs industry demand from the role intelligence dataset — academic governance view"
          action={<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><FlaskConical size={19} /></span>}
        />
        <CardBody className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-400">
                <th className="p-2">Course / module</th>
                <th className="p-2">Skills taught</th>
                <th className="p-2 text-center">Industry relevance</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2">Suggested action</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="p-2">
                    <p className="font-semibold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.area}</p>
                  </td>
                  <td className="p-2 text-slate-600">{c.taughtNames.join(', ')}</td>
                  <td className="p-2 text-center font-bold text-slate-700">{Math.round(c.relevance * 100)}%</td>
                  <td className="p-2 text-center"><Badge tone={STATUS_TONES[c.status]}>{c.status}</Badge></td>
                  <td className="p-2 text-slate-500">{c.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <Landmark size={13} /> Institutional demo identities; real authenticated college data can replace the demo cohort later.
      </p>
    </div>
  )
}
