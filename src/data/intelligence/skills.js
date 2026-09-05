// Canonical Skill Taxonomy (Phase 3 — Industry Intelligence foundation).
// Every skill has a stable canonical `id` used internally by roles, matching,
// gap analysis and future modules. Display names and aliases are only for
// humans and for normalizing input from other sources (student profiles,
// ESCO/O*NET ingestion, employer feedback).

export const SKILL_TAXONOMY = [
  // ---- Programming ----
  { id: 'python', name: 'Python', category: 'Programming', description: 'General-purpose programming language widely used in backend, data and AI work.', aliases: ['Python3', 'Py'] },
  { id: 'javascript', name: 'JavaScript', category: 'Programming', description: 'Programming language primarily used for interactive web development.', aliases: ['JS', 'Javascript', 'Java Script', 'JavaScript ES6', 'ECMAScript'] },
  { id: 'typescript', name: 'TypeScript', category: 'Programming', description: 'Typed superset of JavaScript used for large-scale web applications.', aliases: ['TS'] },
  { id: 'java', name: 'Java', category: 'Programming', description: 'Object-oriented language common in enterprise backend systems.', aliases: [] },
  { id: 'cpp', name: 'C++', category: 'Programming', description: 'Systems-level language used for performance-critical software.', aliases: ['C Plus Plus', 'CPP'] },
  { id: 'c', name: 'C', category: 'Programming', description: 'Foundational systems language underlying operating systems and embedded software.', aliases: ['C Language', 'C Programming'] },
  { id: 'sql', name: 'SQL', category: 'Programming', description: 'Query language for relational databases.', aliases: ['Structured Query Language', 'MySQL', 'Postgres', 'PostgreSQL'] },

  // ---- Frontend ----
  { id: 'html', name: 'HTML', category: 'Frontend', description: 'Markup language that structures web page content.', aliases: ['HTML5'] },
  { id: 'css', name: 'CSS', category: 'Frontend', description: 'Stylesheet language for layout and visual design of web pages.', aliases: ['CSS3'] },
  { id: 'react', name: 'React', category: 'Frontend', description: 'Component-based JavaScript library for building user interfaces.', aliases: ['ReactJS', 'React.js', 'React JS'] },
  { id: 'responsive_design', name: 'Responsive Design', category: 'Frontend', description: 'Designing layouts that adapt across mobile, tablet and desktop screens.', aliases: ['Responsive Web Design', 'Mobile-first Design', 'RWD'] },
  { id: 'web_accessibility', name: 'Web Accessibility', category: 'Frontend', description: 'Building interfaces usable by people with diverse abilities (a11y).', aliases: ['a11y', 'Accessibility'] },

  // ---- Backend ----
  { id: 'nodejs', name: 'Node.js', category: 'Backend', description: 'JavaScript runtime for building scalable server-side applications.', aliases: ['Node', 'NodeJS', 'Node.js'] },
  { id: 'rest_apis', name: 'REST APIs', category: 'Backend', description: 'Designing and consuming RESTful web services.', aliases: ['REST', 'RESTful APIs', 'REST API', 'APIs'] },
  { id: 'databases', name: 'Databases', category: 'Backend', description: 'Modelling, querying and managing application data stores.', aliases: ['Database Design', 'DBMS', 'MongoDB'] },
  { id: 'authentication', name: 'Authentication', category: 'Backend', description: 'Identity, sessions, tokens and authorization in applications.', aliases: ['Auth', 'Authorization', 'JWT', 'OAuth'] },
  { id: 'backend_architecture', name: 'Backend Architecture', category: 'Backend', description: 'Structuring server applications: services, layering and scalability patterns.', aliases: ['Backend Development', 'Server-side Development', 'System Design Basics'] },

  // ---- Data Analytics ----
  { id: 'excel', name: 'Excel', category: 'Data Analytics', description: 'Spreadsheet analysis, formulas and reporting.', aliases: ['MS Excel', 'Spreadsheets'] },
  { id: 'pandas', name: 'Pandas', category: 'Data Analytics', description: 'Python library for data manipulation and analysis.', aliases: ['Panda'] },
  { id: 'numpy', name: 'NumPy', category: 'Data Analytics', description: 'Python library for numerical computing with arrays.', aliases: ['Numpy', 'Num Py'] },
  { id: 'power_bi', name: 'Power BI', category: 'Data Analytics', description: 'Business intelligence tool for dashboards and reporting.', aliases: ['PowerBI', 'Power Bi'] },
  { id: 'data_visualization', name: 'Data Visualization', category: 'Data Analytics', description: 'Communicating insights through charts and dashboards.', aliases: ['Data Viz', 'Visualization', 'Matplotlib', 'Seaborn'] },
  { id: 'statistics', name: 'Statistics', category: 'Data Analytics', description: 'Descriptive and inferential statistics for data-driven decisions.', aliases: ['Stats', 'Statistical Analysis'] },

  // ---- AI / Machine Learning ----
  { id: 'machine_learning', name: 'Machine Learning', category: 'AI / Machine Learning', description: 'Training models that learn patterns from data.', aliases: ['ML'] },
  { id: 'deep_learning', name: 'Deep Learning', category: 'AI / Machine Learning', description: 'Neural-network approaches for complex pattern recognition.', aliases: ['DL', 'Neural Networks'] },
  { id: 'tensorflow', name: 'TensorFlow', category: 'AI / Machine Learning', description: 'Framework for building and deploying ML models.', aliases: ['TF', 'TF2'] },
  { id: 'pytorch', name: 'PyTorch', category: 'AI / Machine Learning', description: 'Deep learning framework popular in research and production.', aliases: ['Torch'] },
  { id: 'scikit_learn', name: 'Scikit-learn', category: 'AI / Machine Learning', description: 'Python library for classical machine learning algorithms.', aliases: ['Sklearn', 'Scikit learn', 'Sci-kit learn'] },
  { id: 'data_preprocessing', name: 'Data Preprocessing', category: 'AI / Machine Learning', description: 'Cleaning, transforming and preparing data for analysis and modelling.', aliases: ['Data Cleaning', 'Data Wrangling', 'Feature Engineering Basics'] },

  // ---- Engineering / Tools ----
  { id: 'git', name: 'Git', category: 'Engineering / Tools', description: 'Distributed version control for source code.', aliases: ['Version Control'] },
  { id: 'github', name: 'GitHub', category: 'Engineering / Tools', description: 'Collaboration platform for Git repositories and workflows.', aliases: ['Git Hub'] },
  { id: 'docker', name: 'Docker', category: 'Engineering / Tools', description: 'Containerization for consistent, portable deployments.', aliases: ['Containers', 'Containerization'] },
  { id: 'cloud_fundamentals', name: 'Cloud Fundamentals', category: 'Engineering / Tools', description: 'Core cloud concepts: compute, storage, networking and deployment basics.', aliases: ['Cloud Computing Basics', 'AWS Basics', 'Cloud'] },
  { id: 'linux', name: 'Linux', category: 'Engineering / Tools', description: 'Command-line fluency and operating-system fundamentals.', aliases: ['Unix', 'Bash', 'Shell Scripting'] },
]

export const SKILL_CATEGORIES = [...new Set(SKILL_TAXONOMY.map((s) => s.category))]
