import { Link } from 'react-router-dom'
import {
  Network,
  ArrowRight,
  ScanSearch,
  GitCompareArrows,
  ListChecks,
  FileText,
  UserRound,
  Database,
  Sparkles,
  Check,
} from 'lucide-react'

const FEATURES = [
  {
    icon: ScanSearch,
    title: 'Role Matching',
    text: 'Discover career roles that align with your current skills and interests.',
  },
  {
    icon: GitCompareArrows,
    title: 'Skill Gap Analysis',
    text: 'Understand the difference between your current skills and industry expectations.',
  },
  {
    icon: ListChecks,
    title: 'Smart Recommendations',
    text: 'Identify which skills will have the greatest impact on your career readiness.',
  },
  {
    icon: FileText,
    title: 'Career Report',
    text: 'Receive a clear, personalized explanation of your strengths, gaps, and next steps.',
  },
]

function LandingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white">
            <Network size={18} />
          </span>
          <span className="text-[15px] font-bold tracking-tight text-slate-900">SkillSynapse</span>
        </Link>
        <nav className="ml-8 hidden items-center gap-6 text-sm font-medium text-slate-500 md:flex">
          <a href="#how" className="hover:text-slate-900">How it works</a>
          <a href="#features" className="hover:text-slate-900">Features</a>
          <Link to="/dashboard" className="hover:text-slate-900">Dashboard</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/dashboard"
            className="hidden rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:block"
          >
            Dashboard
          </Link>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Analyze My Skills <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  )
}

function IntelligenceVisual() {
  return (
    <div id="how" className="relative mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_24px_-12px_rgba(15,23,42,0.12)] sm:p-8">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          Product intelligence
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          <Sparkles size={13} /> Live in this demo
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
            <UserRound size={19} />
          </div>
          <p className="mt-4 text-[15px] font-semibold text-slate-900">Student Profile</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Education, skills, proficiency, interests and goals.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {['Python', 'React', 'SQL'].map((s) => (
              <span key={s} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="hidden items-center md:flex" aria-hidden>
          <div className="h-px w-8 bg-gradient-to-r from-blue-300 to-violet-300" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
            <Database size={19} />
          </div>
          <p className="mt-4 text-[15px] font-semibold text-slate-900">Industry Intelligence</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Role requirements, mapped expectations and skill demand signals.
          </p>
          <div className="mt-4 space-y-2">
            <div className="h-2 rounded-full bg-gradient-to-r from-blue-200 to-violet-200" />
            <div className="h-2 w-3/4 rounded-full bg-slate-200" />
            <div className="h-2 w-1/2 rounded-full bg-slate-200" />
          </div>
        </div>

        <div className="hidden items-center md:flex" aria-hidden>
          <div className="h-px w-8 bg-gradient-to-r from-blue-300 to-violet-300" />
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 p-5 text-white shadow-[0_12px_40px_-12px_rgba(37,99,235,0.5)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Sparkles size={19} />
          </div>
          <p className="mt-4 text-[15px] font-semibold">Career Intelligence</p>
          <p className="mt-1 text-sm leading-relaxed text-blue-100">
            Role matches, gaps, priorities and a readable career report.
          </p>
          <div className="mt-4 space-y-1.5 text-[13px]">
            {['Role fit score', 'Top 3 skill gaps', 'Next best skill'].map((t) => (
              <p key={t} className="flex items-center gap-2 text-blue-50">
                <Check size={14} className="text-emerald-300" /> {t}
              </p>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-slate-400">
        Student Profile&nbsp;&nbsp;→&nbsp;&nbsp;Industry Intelligence&nbsp;&nbsp;→&nbsp;&nbsp;Career Intelligence
      </p>
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <LandingNav />

      <main className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[560px]" aria-hidden />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-200/50 to-violet-200/50 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Data-driven Career &amp; Skill Intelligence
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl">
              Understand Your Skills.{' '}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Discover Your Direction.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
              SkillSynapse analyzes your current skills against industry requirements to help you
              discover suitable career paths, identify skill gaps, and prioritize what to learn next.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/profile"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-[15px] font-semibold text-white shadow-[0_12px_40px_-12px_rgba(37,99,235,0.55)] transition hover:bg-blue-700 sm:w-auto"
              >
                Analyze My Skills <ArrowRight size={17} />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-[15px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
              >
                View demo dashboard
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              No sign-up needed for the demo · Built for Smart India Hackathon
            </p>
          </div>

          <IntelligenceVisual />

          <section id="features" className="mt-12">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                  Platform
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Everything you need to plan your career
                </h2>
              </div>
              <Link to="/profile" className="hidden items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800 sm:inline-flex">
                Get started <ArrowRight size={15} />
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_24px_-12px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <f.icon size={19} />
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white">
              <Network size={14} />
            </span>
            <span><span className="font-semibold text-slate-600">SkillSynapse</span> · Understand Your Skills. Discover Your Direction.</span>
          </p>
          <p className="text-xs">Smart India Hackathon · Deterministic career intelligence demo</p>
        </div>
      </footer>
    </div>
  )
}
