export const EDUCATION_LEVELS = ['Undergraduate', 'Postgraduate', 'Other']

export const DEGREES = ['B.Tech', 'B.E.', 'B.Sc', 'BCA', 'Other']

export const BRANCH_SUGGESTIONS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Data Science',
  'AI & Machine Learning',
  'Other',
]

export const INTEREST_OPTIONS = [
  'Web Development',
  'Mobile Development',
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Cybersecurity',
  'Cloud Computing',
  'Software Engineering',
  'Game Development',
  'UI/UX Design',
]

export const CAREER_PREFERENCE_OPTIONS = [
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'Data Analyst',
  'Data Scientist',
  'AI/ML Engineer',
  'Cybersecurity Engineer',
  'Cloud Engineer',
  'Software Engineer',
  'DevOps Engineer',
]

export function proficiencyLabel(value) {
  if (value <= 25) return 'Beginner'
  if (value <= 50) return 'Basic'
  if (value <= 75) return 'Intermediate'
  return 'Advanced'
}
