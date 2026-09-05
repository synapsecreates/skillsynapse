// Demo curriculum dataset (Phase 8).
// DEMO / PROTOTYPE data: illustrative taught modules. Each module lists the
// canonical skills it covers plus a teaching emphasis weight (1 = light,
// 2 = moderate, 3 = heavy). Alignment status is DERIVED deterministically
// (see stakeholderAggregation.js) — never hand-assigned here.

export const DEMO_CURRICULUM = [
  {
    id: 'mod_web_fund',
    name: 'Web Development Fundamentals',
    area: 'Software Development',
    skills: [
      { skillId: 'html', emphasis: 3 },
      { skillId: 'css', emphasis: 3 },
      { skillId: 'javascript', emphasis: 2 },
      { skillId: 'responsive_design', emphasis: 1 },
    ],
  },
  {
    id: 'mod_db_systems',
    name: 'Database Systems',
    area: 'Data',
    skills: [
      { skillId: 'sql', emphasis: 3 },
      { skillId: 'databases', emphasis: 2 },
      { skillId: 'excel', emphasis: 1 },
    ],
  },
  {
    id: 'mod_ml_basics',
    name: 'Machine Learning Basics',
    area: 'Artificial Intelligence',
    skills: [
      { skillId: 'python', emphasis: 2 },
      { skillId: 'statistics', emphasis: 2 },
      { skillId: 'machine_learning', emphasis: 1 },
    ],
  },
  {
    id: 'mod_tools_lab',
    name: 'Software Tools Lab',
    area: 'Engineering Practice',
    skills: [
      { skillId: 'github', emphasis: 3 },
      { skillId: 'git', emphasis: 1 },
      { skillId: 'linux', emphasis: 1 },
    ],
  },
  {
    id: 'mod_c_programming',
    name: 'Programming in C',
    area: 'Systems',
    skills: [
      { skillId: 'c', emphasis: 3 },
      { skillId: 'cpp', emphasis: 1 },
    ],
  },
]
