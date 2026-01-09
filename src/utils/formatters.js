/**
 * Response Formatters
 * 
 * Transform JSON API responses into natural language.
 * This is where MCP adds value: turning data into insights.
 * 
 * Each formatter takes structured API JSON and returns
 * conversational text that Claude can present to users.
 */

/**
 * Format comparison results
 */
export function formatComparison(apiResponse, timeRange) {
  const { tools } = apiResponse;
  
  if (!tools || tools.length === 0) {
    return 'No tools found for comparison.';
  }

  let output = `📊 Comparing ${tools.length} AI Developer Tools (${timeRange})\n\n`;
  
  // Format each tool's metrics
  tools.forEach((tool, index) => {
    output += `**${index + 1}. ${tool.name}** (\`${tool.package}\`)\n`;
    output += `   • Monthly Downloads: ${formatNumber(tool.npm_downloads_monthly)} `;
    output += `(${tool.growth_indicator} ${tool.growth_pct}% vs last period)\n`;
    output += `   • GitHub Stars: ${formatNumber(tool.github_stars)}\n`;
    output += `   • Community: ${tool.stackoverflow_questions_30d} SO questions, `;
    output += `${tool.reddit_mentions_30d} Reddit mentions\n\n`;
  });
  
  // Add key insights
  const fastest = tools.reduce((max, tool) => 
    tool.growth_pct > max.growth_pct ? tool : max
  );
  
  const mostPopular = tools.reduce((max, tool) =>
    tool.npm_downloads_monthly > max.npm_downloads_monthly ? tool : max
  );
  
  output += `**Key Insights:**\n`;
  output += `• **Fastest Growing:** ${fastest.name} (+${fastest.growth_pct}%)\n`;
  output += `• **Most Downloads:** ${mostPopular.name} `;
  output += `(${formatNumber(mostPopular.npm_downloads_monthly)}/month)\n`;
  
  return output;
}

/**
 * Format trending tools
 */
export function formatTrending(apiResponse, timeRange, limit) {
  const { tools } = apiResponse;
  
  if (!tools || tools.length === 0) {
    return `No trending tools found for ${timeRange}.`;
  }

  let output = `🔥 Fastest Growing AI Developer Tools (${timeRange})\n\n`;
  
  tools.forEach((tool, index) => {
    // Growth indicator emojis
    let indicator = '📈';
    if (tool.growth_pct > 50) indicator = '🔥';
    else if (tool.growth_pct > 20) indicator = '⚡';
    
    output += `${index + 1}. ${indicator} **${tool.name}**\n`;
    output += `   Growth: +${tool.growth_pct}% (${formatNumber(tool.npm_downloads_monthly)} downloads/month)\n`;
    output += `   Category: ${tool.category}\n\n`;
  });
  
  return output;
}

/**
 * Format tool history
 */
export function formatHistory(apiResponse, toolId, months) {
  const { data } = apiResponse;
  
  if (!data || data.length === 0) {
    return `No historical data found for ${toolId}.`;
  }

  const toolName = data[0].name || toolId;
  
  let output = `📈 ${toolName.toUpperCase()} - ${months} Month History\n\n`;
  output += `**Download Trend:**\n`;
  
  // Show data points
  data.forEach(point => {
    output += `${point.month}: ${formatNumber(point.downloads)} downloads\n`;
  });
  
  // Calculate growth
  const first = data[0];
  const last = data[data.length - 1];
  const totalGrowth = ((last.downloads - first.downloads) / first.downloads * 100).toFixed(1);
  const avgMonthlyGrowth = (totalGrowth / months).toFixed(1);
  
  output += `\n**Growth Analysis:**\n`;
  output += `• Total Growth: ${totalGrowth > 0 ? '+' : ''}${totalGrowth}% over ${months} months\n`;
  output += `• Average Monthly: ${avgMonthlyGrowth > 0 ? '+' : ''}${avgMonthlyGrowth}%\n`;
  output += `• Current: ${formatNumber(last.downloads)} downloads/month\n`;
  
  return output;
}

/**
 * Format search results
 */
export function formatSearchResults(apiResponse, filters) {
  const { results, count } = apiResponse;
  
  if (count === 0) {
    return 'No tools found matching your search criteria.';
  }

  let output = `🔍 AI Developer Tools Search Results\n\n`;
  
  // Show active filters
  const activeFilters = [];
  if (filters.category) activeFilters.push(`Category: ${filters.category}`);
  if (filters.min_downloads) activeFilters.push(`Min Downloads: ${formatNumber(filters.min_downloads)}`);
  if (filters.keyword) activeFilters.push(`Keyword: "${filters.keyword}"`);
  
  if (activeFilters.length > 0) {
    output += `**Filters:** ${activeFilters.join(' | ')}\n`;
    output += `**Found:** ${count} tool${count === 1 ? '' : 's'}\n\n`;
  }
  
  // List results
  results.forEach((tool, index) => {
    output += `${index + 1}. **${tool.name}** (\`${tool.package}\`)\n`;
    output += `   ${tool.description}\n`;
    output += `   • ${formatNumber(tool.npm_downloads_monthly)} downloads/month\n`;
    output += `   • ${formatNumber(tool.github_stars)} GitHub stars\n`;
    output += `   • Category: ${tool.category}\n\n`;
  });
  
  // Summary statistics
  const totalDownloads = results.reduce((sum, t) => sum + t.npm_downloads_monthly, 0);
  const avgDownloads = Math.round(totalDownloads / results.length);
  
  output += `**Summary:**\n`;
  output += `• Total Monthly Downloads: ${formatNumber(totalDownloads)}\n`;
  output += `• Average per Tool: ${formatNumber(avgDownloads)}\n`;
  
  return output;
}

/**
 * Format error message
 */
export function formatError(error, context = '') {
  let message = '❌ ';
  
  if (context) {
    message += `Unable to ${context}: `;
  }
  
  message += error.message || 'An unexpected error occurred';
  
  // Add helpful suggestions based on error type
  if (error.message.includes('not found')) {
    message += '\n\nTry searching for available tools first, or check the tool name spelling.';
  } else if (error.message.includes('timeout')) {
    message += '\n\nPlease try again in a moment.';
  }
  
  return message;
}

/**
 * Helper: Format large numbers
 */
export function formatNumber(num) {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)}K`;
  }
  return num.toString();
}

/**
 * Helper: Format growth indicator
 */
export function formatGrowthIndicator(growthPct) {
  if (growthPct > 50) return '🔥';
  if (growthPct > 20) return '⚡';
  if (growthPct > 0) return '↑';
  if (growthPct < 0) return '↓';
  return '→';
}