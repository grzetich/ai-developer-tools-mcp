/**
 * Search Tool
 *
 * Search and filter AI developer tools by various criteria.
 *
 * Design Decisions:
 * - All parameters are optional (flexible querying)
 * - Supports combining filters (category AND min_downloads)
 * - Returns structured summaries rather than raw data dumps
 *
 * This demonstrates a pattern where the tool provides flexible querying
 * capabilities, letting Claude construct sophisticated queries based on
 * user questions.
 *
 * Example user queries that would use this:
 * - "Show me all LLM API SDKs"
 * - "What frameworks have over 5M downloads?"
 * - "Find tools related to cursor"
 */

import { searchTools as searchData, CURRENT_METRICS } from '../data/mock-data.js';

export const searchTool = {
  name: 'search_tools',
  description: 'Search and filter AI developer tools by category, popularity, or keyword',

  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['llm-api', 'editor', 'assistant', 'framework'],
        description: 'Filter by tool category'
      },
      min_downloads: {
        type: 'integer',
        minimum: 0,
        description: 'Minimum monthly downloads (e.g., 1000000 for 1M+)'
      },
      keyword: {
        type: 'string',
        description: 'Search for keyword in tool name or description'
      },
      sort_by: {
        type: 'string',
        enum: ['downloads', 'stars', 'name'],
        default: 'downloads',
        description: 'How to sort results'
      }
    },
    // No required parameters - all filters are optional
    additionalProperties: false
  },

  async execute(args) {
    const { category, min_downloads, keyword, sort_by = 'downloads' } = args;

    // Perform search
    let results = searchData({ category, min_downloads, keyword });

    // Apply sorting
    if (sort_by === 'downloads') {
      results.sort((a, b) => b.npm_downloads_monthly - a.npm_downloads_monthly);
    } else if (sort_by === 'stars') {
      results.sort((a, b) => b.github_stars - a.github_stars);
    } else if (sort_by === 'name') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Build output
    let output = `🔍 AI Developer Tools Search Results\n\n`;

    // Show active filters
    const activeFilters = [];
    if (category) activeFilters.push(`Category: ${category}`);
    if (min_downloads) activeFilters.push(`Min Downloads: ${formatNumber(min_downloads)}`);
    if (keyword) activeFilters.push(`Keyword: "${keyword}"`);

    if (activeFilters.length > 0) {
      output += `**Filters:** ${activeFilters.join(' | ')}\n`;
      output += `**Sort:** ${sort_by}\n\n`;
    }

    // Results
    if (results.length === 0) {
      output += `No tools found matching your criteria.`;
      return output;
    }

    output += `**Found ${results.length} tool${results.length === 1 ? '' : 's'}:**\n\n`;

    results.forEach((tool, index) => {
      output += `${index + 1}. **${tool.name}** (\`${tool.package}\`)\n`;
      output += `   - ${tool.description}\n`;
      output += `   - Category: ${tool.category}\n`;
      output += `   - Monthly Downloads: ${formatNumber(tool.npm_downloads_monthly)}\n`;
      output += `   - GitHub Stars: ${formatNumber(tool.github_stars)}\n`;
      output += `   - Community: ${tool.stackoverflow_questions_30d} SO questions, ${tool.reddit_mentions_30d} Reddit mentions (30d)\n\n`;
    });

    // Summary stats
    const totalDownloads = results.reduce((sum, t) => sum + t.npm_downloads_monthly, 0);
    const avgDownloads = totalDownloads / results.length;

    output += `**Summary Statistics**\n`;
    output += `• Total Monthly Downloads: ${formatNumber(totalDownloads)}\n`;
    output += `• Average per Tool: ${formatNumber(Math.round(avgDownloads))}\n`;

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
