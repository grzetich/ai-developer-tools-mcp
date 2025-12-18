/**
 * Trending Tool
 *
 * Shows the fastest-growing AI developer tools over a specified time period.
 *
 * Design Decisions:
 * - Focuses on growth rate rather than absolute numbers (more interesting signal)
 * - Limits results to prevent overwhelming the user
 * - Sorts by growth % to highlight emerging tools
 *
 * This demonstrates a pattern where the tool performs calculations/aggregations
 * rather than just returning raw data. The AI agent gets insights, not just numbers.
 */

import { CURRENT_METRICS, TOOLS, getGrowthMetrics, getToolsByMetric } from '../data/mock-data.js';

export const trendingTool = {
  name: 'get_trending_tools',
  description: 'Get the fastest-growing AI developer tools over a time period, ranked by adoption growth rate',

  inputSchema: {
    type: 'object',
    properties: {
      time_range: {
        type: 'string',
        enum: ['7d', '30d', '90d'],
        default: '30d',
        description: 'Time period to analyze for growth trends'
      },
      limit: {
        type: 'integer',
        minimum: 3,
        maximum: 10,
        default: 5,
        description: 'Maximum number of tools to return (3-10)'
      },
      category: {
        type: 'string',
        enum: ['llm-api', 'editor', 'assistant', 'framework', 'all'],
        default: 'all',
        description: 'Filter by tool category, or "all" for no filter'
      }
    }
  },

  async execute(args) {
    const { time_range = '30d', limit = 5, category = 'all' } = args;

    // Get all tools with their current metrics
    let toolsList = getToolsByMetric('npm_downloads_monthly');

    // Filter by category if specified
    if (category !== 'all') {
      toolsList = toolsList.filter(t => t.category === category);
    }

    // Calculate growth for each tool
    const months = time_range === '90d' ? 3 : 1;
    const toolsWithGrowth = toolsList.map(tool => {
      const growth = getGrowthMetrics(tool.id, months);
      return {
        ...tool,
        growth_pct: growth?.growth_pct || 0,
        current_downloads: growth?.current || tool.npm_downloads_monthly
      };
    });

    // Sort by growth rate (descending)
    toolsWithGrowth.sort((a, b) => b.growth_pct - a.growth_pct);

    // Take top N
    const trending = toolsWithGrowth.slice(0, limit);

    // Format output
    let output = `🚀 Trending AI Developer Tools\n`;
    output += `📅 Period: ${time_range}`;
    if (category !== 'all') {
      output += ` | Category: ${category}`;
    }
    output += `\n\n`;

    // Rankings
    output += `**Fastest Growing**\n`;
    trending.forEach((tool, index) => {
      const rank = index + 1;
      const growthIcon = tool.growth_pct > 50 ? '🔥' :
                        tool.growth_pct > 20 ? '⚡' : '📈';

      output += `${rank}. ${growthIcon} **${tool.name}**\n`;
      output += `   - Growth: +${tool.growth_pct.toFixed(1)}% over ${time_range}\n`;
      output += `   - Current: ${formatNumber(tool.current_downloads)} downloads/month\n`;
      output += `   - ${tool.description}\n`;
    });

    // Context note
    output += `\n_Growth calculated from ${time_range} historical data_`;

    return output;
  }
};

function formatNumber(num) {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)}K`;
  }
  return num.toString();
}
