/**
 * Mock data for demonstration purposes
 *
 * In production, this would be replaced with real database queries or API calls.
 * This simplified dataset demonstrates the data structures and patterns without
 * exposing proprietary business logic.
 */

// Simplified tool metadata
export const TOOLS = {
  'openai': {
    name: 'OpenAI SDK',
    package: 'openai',
    description: 'Official OpenAI API client',
    category: 'llm-api'
  },
  'anthropic': {
    name: 'Anthropic SDK',
    package: '@anthropic-ai/sdk',
    description: 'Official Anthropic API client',
    category: 'llm-api'
  },
  'cursor': {
    name: 'Cursor',
    package: 'cursor-api',
    description: 'AI-first code editor',
    category: 'editor'
  },
  'copilot': {
    name: 'GitHub Copilot',
    package: '@github/copilot',
    description: 'AI pair programmer',
    category: 'assistant'
  },
  'langchain': {
    name: 'LangChain',
    package: 'langchain',
    description: 'Framework for LLM applications',
    category: 'framework'
  }
};

// Mock current adoption metrics (would come from latest_npm_stats in production)
export const CURRENT_METRICS = {
  'openai': {
    npm_downloads_monthly: 36_143_000,
    npm_downloads_weekly: 8_650_000,
    github_stars: 18_500,
    stackoverflow_questions_30d: 145,
    reddit_mentions_30d: 892,
    last_updated: '2025-01-15'
  },
  'anthropic': {
    npm_downloads_monthly: 13_925_000,
    npm_downloads_weekly: 3_349_000,
    github_stars: 4_200,
    stackoverflow_questions_30d: 67,
    reddit_mentions_30d: 423,
    last_updated: '2025-01-15'
  },
  'cursor': {
    npm_downloads_monthly: 450_000,
    npm_downloads_weekly: 112_000,
    github_stars: 12_300,
    stackoverflow_questions_30d: 89,
    reddit_mentions_30d: 1_250,
    last_updated: '2025-01-15'
  },
  'copilot': {
    npm_downloads_monthly: 2_100_000,
    npm_downloads_weekly: 525_000,
    github_stars: 8_900,
    stackoverflow_questions_30d: 234,
    reddit_mentions_30d: 678,
    last_updated: '2025-01-15'
  },
  'langchain': {
    npm_downloads_monthly: 5_711_000,
    npm_downloads_weekly: 1_427_000,
    github_stars: 87_500,
    stackoverflow_questions_30d: 456,
    reddit_mentions_30d: 1_890,
    last_updated: '2025-01-15'
  }
};

// Mock historical data for trend analysis (would come from npm_packages in production)
// Simplified to just show monthly snapshots
export const HISTORICAL_DATA = {
  'openai': [
    { month: '2024-07', downloads: 18_500_000 },
    { month: '2024-08', downloads: 21_200_000 },
    { month: '2024-09', downloads: 24_800_000 },
    { month: '2024-10', downloads: 28_100_000 },
    { month: '2024-11', downloads: 32_400_000 },
    { month: '2024-12', downloads: 36_143_000 }
  ],
  'anthropic': [
    { month: '2024-07', downloads: 6_200_000 },
    { month: '2024-08', downloads: 7_800_000 },
    { month: '2024-09', downloads: 9_500_000 },
    { month: '2024-10', downloads: 11_200_000 },
    { month: '2024-11', downloads: 12_800_000 },
    { month: '2024-12', downloads: 13_925_000 }
  ],
  'cursor': [
    { month: '2024-07', downloads: 120_000 },
    { month: '2024-08', downloads: 180_000 },
    { month: '2024-09', downloads: 250_000 },
    { month: '2024-10', downloads: 320_000 },
    { month: '2024-11', downloads: 390_000 },
    { month: '2024-12', downloads: 450_000 }
  ],
  'copilot': [
    { month: '2024-07', downloads: 1_800_000 },
    { month: '2024-08', downloads: 1_850_000 },
    { month: '2024-09', downloads: 1_920_000 },
    { month: '2024-10', downloads: 1_980_000 },
    { month: '2024-11', downloads: 2_050_000 },
    { month: '2024-12', downloads: 2_100_000 }
  ],
  'langchain': [
    { month: '2024-07', downloads: 4_100_000 },
    { month: '2024-08', downloads: 4_450_000 },
    { month: '2024-09', downloads: 4_820_000 },
    { month: '2024-10', downloads: 5_200_000 },
    { month: '2024-11', downloads: 5_450_000 },
    { month: '2024-12', downloads: 5_711_000 }
  ]
};

/**
 * Calculate growth rate between two periods
 */
export function calculateGrowth(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get growth metrics for a tool over specified period
 */
export function getGrowthMetrics(toolId, months = 1) {
  const history = HISTORICAL_DATA[toolId];
  if (!history || history.length < 2) return null;

  const latest = history[history.length - 1];
  const compare = history[Math.max(0, history.length - 1 - months)];

  return {
    current: latest.downloads,
    previous: compare.downloads,
    growth_pct: calculateGrowth(latest.downloads, compare.downloads),
    period_months: months
  };
}

/**
 * Get all tools sorted by a metric
 */
export function getToolsByMetric(metric = 'npm_downloads_monthly', limit = 10) {
  const tools = Object.entries(CURRENT_METRICS)
    .map(([id, data]) => ({
      id,
      ...TOOLS[id],
      ...data
    }))
    .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
    .slice(0, limit);

  return tools;
}

/**
 * Search tools by various criteria
 */
export function searchTools(query = {}) {
  const { category, min_downloads, keyword } = query;

  let results = Object.entries(TOOLS).map(([id, tool]) => ({
    id,
    ...tool,
    ...CURRENT_METRICS[id]
  }));

  if (category) {
    results = results.filter(t => t.category === category);
  }

  if (min_downloads) {
    results = results.filter(t => t.npm_downloads_monthly >= min_downloads);
  }

  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    results = results.filter(t =>
      t.name.toLowerCase().includes(lowerKeyword) ||
      t.description.toLowerCase().includes(lowerKeyword)
    );
  }

  return results;
}
