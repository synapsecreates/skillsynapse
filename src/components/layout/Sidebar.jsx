import { Link, NavLink } from 'react-router-dom'
import { Network, ArrowRight } from 'lucide-react'
import { NAV_ITEMS, PORTALS } from '../../data/navigation'
import { cn } from '../../utils/cn'

function PortalNavItem({ item, onNavigate }) {
  return (
    <li>
      <NavLink
        to={item.to}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            isActive
              ? 'bg-blue-600 text-white shadow-[0_12px_40px_-12px_rgba(37,99,235,0.55)]'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          )
        }
      >
        {({ isActive }) => (
          <>
            <item.icon
              size={18}
              className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}
            />
            {item.label}
            {isActive ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/90" /> : null}
          </>
        )}
      </NavLink>
    </li>
  )
}

export function Sidebar({ onNavigate }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 px-5 pb-5 pt-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-[0_12px_40px_-12px_rgba(37,99,235,0.5)]">
          <Network size={18} strokeWidth={2.2} />
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-bold tracking-tight text-slate-900">SkillSynapse</p>
          <p className="text-[11px] font-medium text-slate-400">Career Intelligence</p>
        </div>
      </div>

      <nav className="nice-scroll flex-1 overflow-y-auto px-3">
        {PORTALS.map((portal) => {
          const items = NAV_ITEMS.filter((n) => (n.portal ?? 'student') === portal.id)
          if (items.length === 0) return null
          return (
            <div key={portal.id} className="mb-4">
              <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                {portal.label}
              </p>
              <ul className="space-y-1">
                {items.map((item) => (
                  <PortalNavItem key={item.to} item={item} onNavigate={onNavigate} />
                ))}
              </ul>
            </div>
          )
        })}

        <div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-violet-50 p-4">
          <p className="text-[13px] font-semibold text-slate-900">Career intelligence is live</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Role matching, gap analysis and recommendations run on your saved profile.
          </p>
          <Link
            to="/dashboard"
            onClick={onNavigate}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
          >
            View dashboard <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            S
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold text-slate-900">Student</p>
            <p className="text-[11px] text-slate-400">SIH Demo Account</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
