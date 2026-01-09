/**
 * Search Tool
 * 
 * Search and filter AI developer tools
 */

import { apiClient } from '../api/client.js';
import { formatSearchResults, formatError } from '../utils/formatters.js';

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
    additionalProperties: false
  },

  async execute(args) {
    const {
      category,
      min_downloads,
      keyword,
      sort_by = 'downloads'
    } = args;

    try {
      // Call REST API
      const response = await apiClient.searchTools({
        category,
        min_downloads,
        keyword,
        sort_by
      });
      
      if (!response.ok) {
        throw new Error(response.error.message);
      }

      // Format response
      return formatSearchResults(response.data, args);
      
    } catch (error) {
      return formatError(error, 'search tools');
    }
  }
};