/**
 * Trending Tool
 * 
 * Get fastest-growing AI developer tools
 */

import { apiClient } from '../api/client.js';
import { formatTrending, formatError } from '../utils/formatters.js';

export const trendingTool = {
  name: 'get_trending_tools',
  description: 'Get the fastest-growing AI developer tools ranked by growth rate',

  inputSchema: {
    type: 'object',
    properties: {
      time_range: {
        type: 'string',
        enum: ['7d', '30d', '90d'],
        default: '30d',
        description: 'Time range for measuring growth'
      },
      limit: {
        type: 'integer',
        minimum: 3,
        maximum: 10,
        default: 5,
        description: 'Maximum number of tools to return'
      },
      category: {
        type: 'string',
        enum: ['all', 'llm-api', 'editor', 'assistant', 'framework'],
        default: 'all',
        description: 'Filter by tool category'
      }
    }
  },

  async execute(args) {
    const {
      time_range = '30d',
      limit = 5,
      category = 'all'
    } = args;

    try {
      // Call REST API
      const response = await apiClient.getTrendingTools({
        time_range,
        limit,
        category
      });
      
      if (!response.ok) {
        throw new Error(response.error.message);
      }

      // Format response
      return formatTrending(response.data, time_range, limit);
      
    } catch (error) {
      return formatError(error, 'get trending tools');
    }
  }
};