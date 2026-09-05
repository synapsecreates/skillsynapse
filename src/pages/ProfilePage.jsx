import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  UserRound,
  GraduationCap,
  Code2,
  Heart,
  Compass,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/shared/Card'
import { PageHeader, Badge } from '../components/shared/ui'
import { ChipMultiSelect } from '../components/profile/ChipMultiSelect'
import { SkillSelector, SelectedSkillRow } from '../components/profile/SkillSelector'
import {
  EDUCATION_LEVELS,
  DEGREES,
  BRANCH_SUGGESTIONS,
  INTEREST_OPTIONS,
  CAREER_PREFERENCE_OPTIONS,
} from '../data/profileOptions'
import {
  loadProfile,
  saveProfile,
  clearProfile,
  validateProfile,
} from '../services/profileStorage'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100'
const errorText = 'mt-1.5 text-xs font-medium text-red-600'

function toggleInList(list, item) {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
}

export function ProfilePage() {
  const [initial] = useState(loadProfile)
  const [profile, setProfile] = useState(initial.profile)
  const [hasSaved, setHasSaved] = useState(initial.hasSaved)
  const [fieldErrors, setFieldErrors] = useState({})
  const [warnings, setWarnings] = useState([])
  const [status, setStatus] = useState(hasSavedValue(initial.hasSaved))

  function hasSavedValue(saved) {
    return saved ? 'loaded' : 'idle'
  }

  const setEdu = (patch) =>
    setProfile((p) => ({ ...p, education: { ...p.education, ...patch } }))

  const addSkill = (name) =>
    setProfile((p) => {
      if (p.skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) return p
      return { ...p, skills: [...p.skills, { name, proficiency: 50 }] }
    })

  const updateSkillProficiency = (name, value) =>
    setProfile((p) => ({
      ...p,
      skills: p.skills.map((s) =>
        s.name === name
          ? { ...s, proficiency: Math.min(100, Math.max(0, Math.round(value))) }
          : s,
      ),
    }))

  const removeSkill = (name) =>
    setProfile((p) => ({ ...p, skills: p.skills.filter((s) => s.name !== name) }))

  const completeness = useMemo(() => {
    const done = [
      profile.name.trim() !== '',
      Boolean(profile.education.level && profile.education.degree && profile.education.branch.trim()),
      profile.skills.length > 0,
      profile.interests.length > 0,
      profile.careerPreferences.length > 0,
    ]
    return { count: done.filter(Boolean).length, total: done.length }
  }, [profile])

  const handleSave = () => {
    const { errors, warnings: warns, valid } = validateProfile(profile)
    setFieldErrors(errors)
    setWarnings(warns)
    if (!valid) {
      setStatus('error')
      return
    }
    const clean = saveProfile(profile)
    setProfile(clean)
    setHasSaved(true)
    setStatus('saved')
  }

  const handleClear = () => {
    setProfile(clearProfile())
    setHasSaved(false)
    setFieldErrors({})
    setWarnings([])
    setStatus('idle')
  }

  const eduErrors = fieldErrors.education ?? {}

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Step 1 · Profile"
        title="Student Profile"
        description={
          hasSaved
            ? 'A saved profile was loaded from this browser. Edit any section and save again to update it.'
            : 'Tell SkillSynapse about yourself. Your profile is saved in this browser and becomes the input for future career analysis.'
        }
        actions={
          <>
            {status === 'saved' ? <Badge tone="emerald">Saved ✓</Badge> : null}
            {hasSaved && status !== 'saved' ? <Badge tone="blue">Saved profile loaded</Badge> : null}
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Save size={15} /> Save Profile
            </button>
          </>
        }
      />

      {status === 'saved' ? (
        <Card className="border-emerald-200 bg-emerald-50/60">
          <CardBody className="flex items-start gap-3">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-sm leading-relaxed text-slate-600">
              <span className="font-semibold text-slate-900">Profile saved. </span>
              It will persist after refresh. You can keep editing and save again any time.
            </p>
          </CardBody>
        </Card>
      ) : null}

      {status === 'error' ? (
        <Card className="border-red-200 bg-red-50/60">
          <CardBody className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
            <div className="text-sm leading-relaxed text-slate-600">
              <p className="font-semibold text-slate-900">Please fix the highlighted fields:</p>
              <ul className="mt-1 list-disc pl-5">
                {fieldErrors.name ? <li>{fieldErrors.name}</li> : null}
                {Object.values(eduErrors).map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {/* 1. Basic information */}
      <Card>
        <CardHeader
          title="Basic Information"
          subtitle="Just the essentials — nothing unnecessary."
          action={
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserRound size={19} />
            </span>
          }
        />
        <CardBody>
          <label htmlFor="profile-name" className="text-[13px] font-semibold text-slate-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="profile-name"
            type="text"
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Aarav Sharma"
            className={inputClass}
          />
          {fieldErrors.name ? <p className={errorText}>{fieldErrors.name}</p> : null}
        </CardBody>
      </Card>

      {/* 2. Education */}
      <Card>
        <CardHeader
          title="Education"
          subtitle="Your current education path — flexible for any background."
          action={
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <GraduationCap size={19} />
            </span>
          }
        />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edu-level" className="text-[13px] font-semibold text-slate-700">
                Education Level <span className="text-red-500">*</span>
              </label>
              <select
                id="edu-level"
                value={profile.education.level}
                onChange={(e) => setEdu({ level: e.target.value })}
                className={inputClass}
              >
                <option value="">Select level…</option>
                {EDUCATION_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              {eduErrors.level ? <p className={errorText}>{eduErrors.level}</p> : null}
            </div>
            <div>
              <label htmlFor="edu-degree" className="text-[13px] font-semibold text-slate-700">
                Degree <span className="text-red-500">*</span>
              </label>
              <select
                id="edu-degree"
                value={profile.education.degree}
                onChange={(e) => setEdu({ degree: e.target.value })}
                className={inputClass}
              >
                <option value="">Select degree…</option>
                {DEGREES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {eduErrors.degree ? <p className={errorText}>{eduErrors.degree}</p> : null}
            </div>
            {profile.education.degree === 'Other' ? (
              <div className="sm:col-span-2">
                <label htmlFor="edu-degree-custom" className="text-[13px] font-semibold text-slate-700">
                  Specify your degree <span className="text-red-500">*</span>
                </label>
                <input
                  id="edu-degree-custom"
                  type="text"
                  value={profile.education.degreeCustom}
                  onChange={(e) => setEdu({ degreeCustom: e.target.value })}
                  placeholder="e.g. B.Des, M.Tech, Diploma…"
                  className={inputClass}
                />
                {eduErrors.degreeCustom ? <p className={errorText}>{eduErrors.degreeCustom}</p> : null}
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <label htmlFor="edu-branch" className="text-[13px] font-semibold text-slate-700">
                Branch / Field of Study <span className="text-red-500">*</span>
              </label>
              <input
                id="edu-branch"
                type="text"
                list="branch-suggestions"
                value={profile.education.branch}
                onChange={(e) => setEdu({ branch: e.target.value })}
                placeholder="e.g. Computer Science"
                className={inputClass}
              />
              <datalist id="branch-suggestions">
                {BRANCH_SUGGESTIONS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
              {eduErrors.branch ? <p className={errorText}>{eduErrors.branch}</p> : null}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 3. Skills */}
      <Card>
        <CardHeader
          title="Skills & Proficiency"
          subtitle="Pick from the standard list, then rate each skill 0–100. Standard names keep future analysis accurate."
          action={
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Code2 size={19} />
            </span>
          }
        />
        <CardBody className="space-y-5">
          <SkillSelector selectedSkills={profile.skills} onAdd={addSkill} />
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-slate-700">
                Your skills ({profile.skills.length})
              </p>
              {warnings.length > 0 ? (
                <p className="text-xs font-medium text-amber-600">{warnings[0]}</p>
              ) : null}
            </div>
            {profile.skills.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
                No skills added yet — search above and click a skill to add it.
              </div>
            ) : (
              <div className="space-y-2.5">
                {profile.skills.map((s) => (
                  <SelectedSkillRow
                    key={s.name}
                    skill={s}
                    onProficiencyChange={(v) => updateSkillProficiency(s.name, v)}
                    onRemove={() => removeSkill(s.name)}
                  />
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* 4. Interests */}
      <Card>
        <CardHeader
          title="Interests"
          subtitle="Select all topics you genuinely enjoy. Multiple selection allowed."
          action={
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Heart size={19} />
            </span>
          }
        />
        <CardBody>
          <ChipMultiSelect
            options={INTEREST_OPTIONS}
            selected={profile.interests}
            onToggle={(opt) =>
              setProfile((p) => ({ ...p, interests: toggleInList(p.interests, opt) }))
            }
          />
          <p className="mt-3 text-xs text-slate-400">
            {profile.interests.length} selected
          </p>
        </CardBody>
      </Card>

      {/* 5. Career preferences */}
      <Card>
        <CardHeader
          title="Career Preferences"
          subtitle="Which domains do you want to explore? Multiple selection allowed."
          action={
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Compass size={19} />
            </span>
          }
        />
        <CardBody>
          <ChipMultiSelect
            options={CAREER_PREFERENCE_OPTIONS}
            selected={profile.careerPreferences}
            onToggle={(opt) =>
              setProfile((p) => ({ ...p, careerPreferences: toggleInList(p.careerPreferences, opt) }))
            }
          />
          <p className="mt-3 text-xs text-slate-400">
            {profile.careerPreferences.length} selected
          </p>
        </CardBody>
      </Card>

      {/* Completeness (now real) */}
      <Card>
        <CardHeader
          title="Profile completeness"
          subtitle="Updates automatically as you fill in each section."
          action={
            <Badge tone={completeness.count === completeness.total ? 'emerald' : 'blue'}>
              {completeness.count} of {completeness.total} sections
            </Badge>
          }
        />
        <CardBody>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
              style={{ width: `${(completeness.count / completeness.total) * 100}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Name · Education · Skills · Interests · Career preferences
          </p>
        </CardBody>
      </Card>

      {/* Save bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-6 py-3 text-[15px] font-semibold text-white shadow-[0_12px_40px_-12px_rgba(37,99,235,0.55)] hover:bg-blue-700"
        >
          <Save size={16} /> Save Profile
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-red-600"
        >
          <Trash2 size={15} /> Clear saved profile
        </button>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold text-blue-700 hover:text-blue-800 sm:ml-auto"
        >
          Continue to dashboard <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}
