import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'

export function ChipMultiSelect({ options, selected, onToggle }) {
  const isSelected = (opt) => selected.includes(opt)
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = isSelected(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors',
              active
                ? 'border-blue-600 bg-blue-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)]'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900',
            )}
          >
            {active ? <Check size={14} /> : null}
            {opt}
          </button>
        )
      })}
    </div>
  )
}
