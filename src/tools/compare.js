/**
 * Compare Tool
 * 
 * Demonstrates: MCP tool → API client → Format response
 * 
 * This tool calls the REST API, gets JSON back, and formats
 * it into natural language. The API handles all business logic.
 */

import { apiClient } from '../api/client.js';
import { formatComparison, formatError } from '../utils/formatters.js';

export const compareTool = {
  name: 'compare_tools',
  description: 'Compare adoption metrics between 2-3 AI developer tools (e.g., OpenAI vs Anthropic SDK)',

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
        description: 'Time range: 7d (week), 30d (month), 90d (quarter)'
      }
    },
    required: ['tools']
  },

  async execute(args) {
    const { tools, time_range = '30d' } = args;

    try {
      // Step 1: Call REST API
      const response = await apiClient.compareTools(tools, time_range);
      
      // Step 2: Check for API errors
      if (!response.ok) {
        throw new Error(response.error.message);
      }

      // Step 3: Format JSON → Natural language
      return formatComparison(response.data, time_range);
      
    } catch (error) {
      // Step 4: Return helpful error message
      return formatError(error, 'compare tools');
    }
  }
};