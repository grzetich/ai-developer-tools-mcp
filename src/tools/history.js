/**
 * History Tool
 *
 * Retrieves historical adoption data for a specific AI developer tool.
 *
 * Design Decisions:
 * - Returns time series data as formatted text rather than raw JSON
 *   (easier for Claude to narrate to users)
 * - Includes growth rate calculations to add context
 * - Samples data points when there are many to keep output readable
 *
 * This demonstrates how to transform time-series data into a conversational
 * format that works well in chat interfaces.
 */

import { TOOLS, HISTORICAL_DATA, CURRENT_METRICS, calculateGrowth } from '../data/mock-data.js';

export const historyTool = {
  name: 'get_tool_history',
  description: 'Get historical adoption data and growth trends for a specific AI developer tool',

  inputSchema: {
    type: 'object',
    properties: {
      tool: {
        type: 'string',
        enum: ['openai', 'anthropic', 'cursor', 'copilot', 'langchain'],
        description: 'Tool ID to get history for'
      },
      months: {
        type: 'integer',
        minimum: 3,
        maximum: 12,
        default: 6,
        description: 'Number of months of history to return (3-12)'
      }
    },
    required: ['tool']
  },

  async execute(args) {
    const { tool, months = 6 } = args;

    // Validate tool exists
    if (!TOOLS[tool]) {
      throw new Error(`Unknown tool: ${tool}`);
    }

    const toolInfo = TOOLS[tool];
    const history = HISTORICAL_DATA[tool];
    const currentMetrics = CURRENT_METRICS[tool];

    if (!history || history.length === 0) {
      return `No historical data available for ${toolInfo.name}`;
    }

    // Get the requested number of months (or all available if less)
    const dataPoints = history.slice(-months);

    // Calculate overall growth
    const firstMonth = dataPoints[0];
    const lastMonth = dataPoints[dataPoints.length - 1];
    const totalGrowth = calculateGrowth(lastMonth.downloads, firstMonth.downloads);

    // Format output
    let output = `📈 ${toolInfo.name} - Historical Adoption\n\n`;

    output += `**${toolInfo.description}**\n`;
    output += `Package: \`${toolInfo.package}\`\n`;
    output += `Category: ${toolInfo.category}\n\n`;

    // Timeline
    output += `**Download History (Monthly)**\n`;
    dataPoints.forEach(point => {
      const date = new Date(point.month + '-01');
      const monthStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      output += `• ${monthStr}: ${formatNumber(point.downloads)}\n`;
    });
    output += '\n';

    // Growth analysis
    output += `**Growth Analysis**\n`;
    output += `• Period: ${formatDate(firstMonth.month)} to ${formatDate(lastMonth.month)}\n`;
    output += `• Total Growth: ${totalGrowth > 0 ? '+' : ''}${totalGrowth.toFixed(1)}%\n`;
    output += `• Growth Rate: ${(totalGrowth / months).toFixed(1)}% per month\n\n`;

    // Current metrics
    output += `**Current Metrics**\n`;
    output += `• Monthly Downloads: ${formatNumber(currentMetrics.npm_downloads_monthly)}\n`;
    output += `• GitHub Stars: ${formatNumber(currentMetrics.github_stars)}\n`;
    output += `• Community Activity: ${currentMetrics.stackoverflow_questions_30d} SO questions, ${currentMetrics.reddit_mentions_30d} Reddit mentions (30d)\n`;

    output += `\n_Last updated: ${currentMetrics.last_updated}_`;

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

function formatDate(monthStr) {
  const date = new Date(monthStr + '-01');
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}
