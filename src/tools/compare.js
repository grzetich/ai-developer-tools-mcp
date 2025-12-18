/**
 * Compare Tool
 *
 * Compares adoption metrics between 2-3 AI developer tools.
 *
 * Design Decisions:
 * - Accepts 2-3 tools (enforced by schema) because comparing too many becomes
 *   hard to read in a conversational format
 * - Returns formatted text optimized for Claude to present to users
 * - Includes multiple metrics (downloads, community activity) for holistic view
 *
 * In production, this would query a database for real-time metrics.
 * Here we use mock data to demonstrate the integration pattern.
 */

import { TOOLS, CURRENT_METRICS, getGrowthMetrics } from '../data/mock-data.js';

export const compareTool = {
  name: 'compare_tools',
  description: 'Compare adoption metrics between 2-3 AI developer tools (e.g., OpenAI vs Anthropic SDK)',

  /**
   * Input Schema
   *
   * JSON Schema that defines what parameters this tool accepts.
   * Claude uses this to validate arguments before calling the tool.
   *
   * Key considerations:
   * - Use enum for known values (better UX, prevents typos)
   * - Make descriptions conversational (Claude reads these)
   * - Set sensible mins/maxs to prevent abuse
   */
  inputSchema: {
    type: 'object',
    properties: {
      tools: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['openai', 'anthropic', 'cursor', 'copilot', 'langchain']
        },
        minItems: 2,
        maxItems: 3,
        description: 'Array of 2-3 tool IDs to compare'
      },
      time_range: {
        type: 'string',
        enum: ['7d', '30d', '90d'],
        default: '30d',
        description: 'Time range for comparison metrics'
      }
    },
    required: ['tools']
  },

  /**
   * Execute the comparison
   *
   * Returns formatted text that Claude can present to the user.
   *
   * Formatting Strategy:
   * - Use emojis sparingly for visual hierarchy
   * - Bullet points for scannability
   * - Include growth indicators (↑/↓/↔) for quick insights
   * - End with timestamp for data freshness
   */
  async execute(args) {
    const { tools, time_range = '30d' } = args;

    // Validate tool IDs
    const invalidTools = tools.filter(id => !TOOLS[id]);
    if (invalidTools.length > 0) {
      throw new Error(`Unknown tools: ${invalidTools.join(', ')}`);
    }

    // Build comparison data
    const comparison = tools.map(id => {
      const tool = TOOLS[id];
      const metrics = CURRENT_METRICS[id];
      const growth = getGrowthMetrics(id, time_range === '90d' ? 3 : 1);

      return {
        id,
        name: tool.name,
        downloads_monthly: metrics.npm_downloads_monthly,
        downloads_weekly: metrics.npm_downloads_weekly,
        github_stars: metrics.github_stars,
        stackoverflow_questions: metrics.stackoverflow_questions_30d,
        reddit_mentions: metrics.reddit_mentions_30d,
        growth_pct: growth?.growth_pct || 0,
        last_updated: metrics.last_updated
      };
    });

    // Format output
    let output = `📊 AI Developer Tools Comparison\n`;
    output += `📅 Time Range: ${time_range}\n\n`;

    // NPM Downloads section
    output += `**NPM Downloads (Monthly)**\n`;
    comparison.forEach(tool => {
      const growthIcon = tool.growth_pct > 5 ? '↑' :
                        tool.growth_pct < -5 ? '↓' : '↔';
      output += `• ${tool.name}: ${formatNumber(tool.downloads_monthly)}/month ${growthIcon} ${tool.growth_pct.toFixed(1)}%\n`;
    });
    output += '\n';

    // Community Activity section
    output += `**Community Activity (Last 30 Days)**\n`;
    comparison.forEach(tool => {
      output += `• ${tool.name}:\n`;
      output += `  - GitHub Stars: ${formatNumber(tool.github_stars)}\n`;
      output += `  - Stack Overflow Questions: ${tool.stackoverflow_questions}\n`;
      output += `  - Reddit Mentions: ${tool.reddit_mentions}\n`;
    });
    output += '\n';

    // Summary insight
    const leader = comparison.reduce((prev, curr) =>
      curr.downloads_monthly > prev.downloads_monthly ? curr : prev
    );
    const fastestGrowing = comparison.reduce((prev, curr) =>
      curr.growth_pct > prev.growth_pct ? curr : prev
    );

    output += `**Key Insights**\n`;
    output += `• ${leader.name} leads in adoption with ${formatNumber(leader.downloads_monthly)} monthly downloads\n`;
    output += `• ${fastestGrowing.name} shows fastest growth at ${fastestGrowing.growth_pct.toFixed(1)}% over the period\n`;

    output += `\n_Data updated: ${comparison[0].last_updated}_`;

    return output;
  }
};

/**
 * Format large numbers for readability
 *
 * Helper function to make metrics more readable in text format.
 * E.g., 36143000 → 36.1M
 */
function formatNumber(num) {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)}K`;
  }
  return num.toString();
}
