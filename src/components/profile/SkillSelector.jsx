import { useMemo, useState } from 'react'
import { Search, Plus, X } from 'lucide-react'
import { proficiencyLabel } from '../../data/profileOptions'
import { SELECTABLE_SKILL_CATALOG } from '../../data/intelligence/skillCatalog'
import { normalizeSkill } from '../../utils/skillNormalization'
import { cn } from '../../utils/cn'

/** Stored skills keep display names; compare by canonical id so legacy entries match. */
function selectedCanonicalIds(selectedSkills) {
  return new Set(
    selectedSkills.map((s) => normalizeSkill(s.name) ?? s.name.toLowerCase()),
  )
}

export function SkillSelector({ selectedSkills, onAdd }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const selectedIds = useMemo(() => selectedCanonicalIds(selectedSkills), [selectedSkills])

  const categories = useMemo(
    () => ['All', ...SELECTABLE_SKILL_CATALOG.map((g) => g.category)],
    [],
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const queryId = q ? normalizeSkill(query) : null
    return SELECTABLE_SKILL_CATALOG.filter((g) => category === 'All' || g.category === category).flatMap(
      (g) =>
        g.skills
          .filter(
            (s) =>
              !q ||
              s.name.toLowerCase().includes(q) ||
              s.id.includes(q) ||
              (queryId != null && s.id === queryId),
          )
          .map((s) => ({ id: s.id, name: s.name, category: g.category })),
    )
  }, [query, category])

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills, e.g. Python, React, SQL…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          aria-label="Filter by skill category"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {results.length === 0 ? (
          <p className="text-sm text-slate-400">No skills match “{query}”. Try another search.</p>
        ) : (
          results.map((r) => {
            const added = selectedIds.has(r.id)
            return (
              <button
                key={r.id}
                type="button"
                disabled={added}
                onClick={() => onAdd(r.name)}
                title={added ? 'Already added' : `Add ${r.name}`}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors',
                  added
                    ? 'cursor-default border-slate-100 bg-slate-50 text-slate-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700',
                )}
              >
                {!added ? <Plus size={13} /> : null}
                {r.name}
                <span className={cn('text-[11px]', added ? 'text-slate-300' : 'text-slate-400')}>
                  · {r.category}
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

export function SelectedSkillRow({ skill, onProficiencyChange, onRemove }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{skill.name}</p>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {proficiencyLabel(skill.proficiency)} · {skill.proficiency}
          </span>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${skill.name}`}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-red-600"
          >
            <X size={15} />
          </button>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={skill.proficiency}
          onChange={(e) => onProficiencyChange(Number(e.target.value))}
          aria-label={`${skill.name} proficiency`}
          className="h-2 w-full accent-blue-600"
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] font-medium text-slate-400">
        <span>Beginner</span>
        <span>Basic</span>
        <span>Intermediate</span>
        <span>Advanced</span>
      </div>
    </div>
  )
}
