// Snapshot of valid ai_categories values from live stats (2026-10-03,
// MCP freeserp_stats → top_ai_categories). Do not invent taxonomy.
// Runtime help=1 fetch per page open is not needed — these are the snapshot.
// Full list in docs/API-NOTES.md.

export const AI_CATEGORIES: string[] = [
  'Other AI',
  'AI Agents & Autonomous',
  'AI Automation & Workflows',
  'Code & Dev Tools',
  'E-commerce',
  'Education & Tutoring',
  'Data & Analytics',
  'Marketing & Ads',
  'SEO & Content',
  'Directory / Aggregator',
  'AI Infrastructure & API',
  'AI Chatbot & Assistant',
  'Productivity',
  'Finance & Trading',
  'Healthcare & Medical',
  'Customer Support',
  'Research & Science',
  'AI Website Builder',
  'Writing & Content',
  'No-code / App Builder',
  'AI Search & Answers',
  'Security & Moderation',
  'Image Generation',
  'Recruiting & HR',
  'Social Media',
  'Design & UI',
  'Lead Gen & Outreach',
  'Sales & CRM',
  'Video Generation',
  'Food & Recipe',
]

// Short default set for the heatmap (SPEC §15). Full list above.
export const HEATMAP_CATEGORIES: string[] = [
  'AI Agents & Autonomous',
  'Image Generation',
  'Video Generation',
  'AI Search & Answers',
  'Customer Support',
  'Code & Dev Tools',
]
