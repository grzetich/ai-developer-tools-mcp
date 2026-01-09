/**
 * History Tool
 * 
 * Get historical adoption data for a specific tool
 */

import { apiClient } from '../api/client.js';
import { formatHistory, formatError } from '../utils/formatters.js';

export const historyTool = {
  name: 'get_tool_history',
  description: 'Get historical adoption data and growth trends for a specific AI coding tool over time',

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
        description: 'Number of months of history (3-12)'
      }
    },
    required: ['tool']
  },

  async execute(args) {
    const { tool, months = 6 } = args;

    try {
      // Call REST API
      const response = await apiClient.getToolHistory(tool, months);
      
      if (!response.ok) {
        throw new Error(response.error.message);
      }

      // Format response
      return formatHistory(response.data, tool, months);
      
    } catch (error) {
      return formatError(error, 'get tool history');
    }
  }
};