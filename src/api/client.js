/**
 * API Client
 * 
 * Simulates REST API calls in this demo.
 * In production, replace mock responses with real HTTP requests.
 * 
 * This demonstrates the pattern: MCP Server → REST API → Database
 * 
 * The MCP server should NEVER directly access the database.
 * Always go through the API layer for proper separation of concerns.
 */

import * as mockData from '../data/mock-data.js';

class ApiClient {
  constructor(baseURL = 'https://api.vibe-data.com', options = {}) {
    this.baseURL = baseURL;
    this.apiKey = options.apiKey || process.env.API_KEY;
    this.timeout = options.timeout || 5000;
  }

  /**
   * GET /tools/:id/metrics
   * 
   * Returns current metrics for a specific tool
   * 
   * Production example:
   * const response = await fetch(`${this.baseURL}/tools/${toolId}/metrics`, {
   *   headers: { 'Authorization': `Bearer ${this.apiKey}` }
   * });
   * return await response.json();
   */
  async getToolMetrics(toolId) {
    await this._simulateNetworkDelay();
    
    try {
      const data = mockData.getCurrentMetrics(toolId);
      
      if (!data) {
        return this._errorResponse(404, `Tool '${toolId}' not found`);
      }
      
      return this._successResponse(data);
    } catch (error) {
      return this._errorResponse(500, error.message);
    }
  }

  /**
   * POST /tools/compare
   * 
   * Compare metrics between multiple tools
   * 
   * Body: { tools: string[], time_range: string }
   * 
   * Production example:
   * const response = await fetch(`${this.baseURL}/tools/compare`, {
   *   method: 'POST',
   *   headers: {
   *     'Authorization': `Bearer ${this.apiKey}`,
   *     'Content-Type': 'application/json'
   *   },
   *   body: JSON.stringify({ tools: toolIds, time_range: timeRange })
   * });
   */
  async compareTools(toolIds, timeRange = '30d') {
    await this._simulateNetworkDelay();
    
    try {
      const comparisons = toolIds.map(id => {
        const data = mockData.getCurrentMetrics(id);
        if (!data) {
          throw new Error(`Tool '${id}' not found`);
        }
        return data;
      });
      
      return this._successResponse({
        tools: comparisons,
        time_range: timeRange,
        compared_at: new Date().toISOString()
      });
    } catch (error) {
      return this._errorResponse(400, error.message);
    }
  }

  /**
   * GET /tools/trending
   * 
   * Get fastest-growing tools
   * 
   * Query params: ?time_range=30d&limit=5&category=all
   * 
   * Production example:
   * const params = new URLSearchParams({ time_range, limit, category });
   * const response = await fetch(`${this.baseURL}/tools/trending?${params}`);
   */
  async getTrendingTools(params = {}) {
    await this._simulateNetworkDelay();
    
    try {
      const {
        time_range = '30d',
        limit = 5,
        category = 'all'
      } = params;
      
      const trending = mockData.getTrendingTools(time_range, limit, category);
      
      return this._successResponse({
        tools: trending,
        time_range,
        category,
        fetched_at: new Date().toISOString()
      });
    } catch (error) {
      return this._errorResponse(500, error.message);
    }
  }

  /**
   * GET /tools/search
   * 
   * Search and filter tools
   * 
   * Query params: ?category=llm-api&min_downloads=1000000&keyword=openai
   * 
   * Production example:
   * const params = new URLSearchParams(searchParams);
   * const response = await fetch(`${this.baseURL}/tools/search?${params}`);
   */
  async searchTools(searchParams = {}) {
    await this._simulateNetworkDelay();
    
    try {
      const results = mockData.searchTools(searchParams);
      
      return this._successResponse({
        results,
        count: results.length,
        filters: searchParams
      });
    } catch (error) {
      return this._errorResponse(500, error.message);
    }
  }

  /**
   * GET /tools/:id/history
   * 
   * Get historical data for a tool
   * 
   * Query params: ?months=6
   * 
   * Production example:
   * const response = await fetch(
   *   `${this.baseURL}/tools/${toolId}/history?months=${months}`
   * );
   */
  async getToolHistory(toolId, months = 6) {
    await this._simulateNetworkDelay();
    
    try {
      const history = mockData.getHistoricalData(toolId, months);
      
      if (!history || history.length === 0) {
        return this._errorResponse(404, `No history found for '${toolId}'`);
      }
      
      return this._successResponse({
        tool_id: toolId,
        months,
        data: history
      });
    } catch (error) {
      return this._errorResponse(500, error.message);
    }
  }

  /**
   * Helper: Format success response
   */
  _successResponse(data) {
    return {
      status: 200,
      ok: true,
      data,
      error: null
    };
  }

  /**
   * Helper: Format error response
   */
  _errorResponse(status, message) {
    return {
      status,
      ok: false,
      data: null,
      error: { message }
    };
  }

  /**
   * Helper: Simulate network latency (50-150ms)
   * Remove in production
   */
  async _simulateNetworkDelay() {
    const delay = Math.random() * 100 + 50;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Export singleton instance
 * 
 * In production, configure with environment variables:
 * 
 * export const apiClient = new ApiClient(
 *   process.env.API_BASE_URL || 'https://api.vibe-data.com',
 *   {
 *     apiKey: process.env.API_KEY,
 *     timeout: 5000
 *   }
 * );
 */
export const apiClient = new ApiClient();

/**
 * Export class for testing
 */
export { ApiClient };