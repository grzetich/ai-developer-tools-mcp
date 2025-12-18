#!/usr/bin/env node

/**
 * AI Developer Tools MCP Server
 *
 * Educational reference implementation demonstrating how to expose AI development
 * tool intelligence through the Model Context Protocol (MCP).
 *
 * This server provides tools for querying adoption metrics, trends, and comparisons
 * of popular AI coding assistants and frameworks.
 *
 * Architecture:
 * - Uses the official MCP SDK for protocol implementation
 * - Implements stdio transport for Claude Desktop integration
 * - Exposes 4 tools with well-defined schemas
 * - Uses mock data for demonstration (production would use real databases/APIs)
 *
 * @see https://github.com/modelcontextprotocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

// Import our tool implementations
import { compareTool } from './tools/compare.js';
import { trendingTool } from './tools/trending.js';
import { historyTool } from './tools/history.js';
import { searchTool } from './tools/search.js';

// Server configuration
const SERVER_NAME = process.env.SERVER_NAME || 'ai-developer-tools-mcp';
const SERVER_VERSION = process.env.SERVER_VERSION || '1.0.0';

/**
 * Initialize the MCP server
 *
 * The Server class from the MCP SDK handles the protocol layer.
 * We configure it with capabilities and metadata.
 */
const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {}, // We provide tool execution capability
    },
  }
);

/**
 * Registry of all available tools
 *
 * Each tool exports a standard interface:
 * - name: Unique identifier for the tool
 * - description: Human-readable explanation of what it does
 * - inputSchema: JSON Schema defining accepted parameters
 * - execute: Async function that performs the tool's action
 */
const tools = [
  compareTool,
  trendingTool,
  historyTool,
  searchTool
];

/**
 * Handle tools/list requests
 *
 * Claude calls this to discover what tools are available.
 * We return the schema for each tool so Claude knows:
 * - What the tool does
 * - What parameters it accepts
 * - What types those parameters should be
 *
 * This is analogous to OpenAPI/Swagger for REST APIs, but optimized
 * for AI agent consumption rather than human developers.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }))
  };
});

/**
 * Handle tools/call requests
 *
 * When Claude wants to use a tool, it sends a call request with:
 * - name: Which tool to invoke
 * - arguments: Parameter values (validated against inputSchema)
 *
 * We find the matching tool and execute it, returning results as text.
 *
 * Error Handling Strategy:
 * - Tool-level errors are caught and returned as error messages
 * - This prevents one failing tool from crashing the entire server
 * - Claude can see the error and potentially retry or ask the user for help
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Find the requested tool
  const tool = tools.find(t => t.name === name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  try {
    // Execute the tool with provided arguments
    const result = await tool.execute(args || {});

    // Return result as text content
    // MCP supports multiple content types, but text is most versatile
    return {
      content: [
        {
          type: 'text',
          text: result
        }
      ]
    };
  } catch (error) {
    // Log error for debugging (goes to stderr, not to Claude)
    console.error(`Error executing tool ${name}:`, error.message);

    // Return user-friendly error message
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

/**
 * Start the server
 *
 * MCP supports multiple transports. We use stdio because:
 * - It's the standard for Claude Desktop integration
 * - Simple IPC mechanism using stdin/stdout
 * - No network configuration needed
 *
 * For production servers that need to handle multiple clients or
 * run remotely, you could also implement HTTP transport.
 */
async function main() {
  try {
    // Create stdio transport
    const transport = new StdioServerTransport();

    // Connect server to transport
    await server.connect(transport);

    // Log to stderr (stdout is reserved for MCP protocol)
    console.error(`${SERVER_NAME} v${SERVER_VERSION} running`);
    console.error(`Tools available: ${tools.map(t => t.name).join(', ')}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 *
 * Ensures the server cleans up properly when stopped.
 * Important for long-running processes.
 */
process.on('SIGINT', async () => {
  console.error('\nShutting down server...');
  await server.close();
  process.exit(0);
});

// Start the server
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
