# AI Developer Tools MCP Server

**Educational reference implementation demonstrating how to expose AI development tool intelligence through the Model Context Protocol (MCP).**

This MCP server enables Claude and other AI assistants to query real-time adoption metrics, trends, and comparisons for popular AI coding tools like OpenAI SDK, Anthropic SDK, Cursor, GitHub Copilot, and LangChain.

[![MCP Version](https://img.shields.io/badge/MCP-1.0.0-blue.svg)](https://github.com/modelcontextprotocol)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)

---

## What It Does

This MCP server makes AI development tool intelligence accessible through natural conversation with Claude. Instead of manually searching NPM stats, GitHub, and Stack Overflow, you can ask:

**Example Queries:**
- _"Compare the adoption of OpenAI SDK vs Anthropic SDK"_
- _"What are the fastest-growing AI coding tools this month?"_
- _"Show me the growth history of Cursor over the last 6 months"_
- _"Find all LLM API frameworks with over 5M downloads"_

Claude uses the exposed tools to fetch data and present insights in natural language, complete with growth trends, community metrics, and comparative analysis.

**What Data Is Exposed:**
- NPM download statistics (weekly/monthly)
- GitHub repository metrics (stars, activity)
- Community engagement (Stack Overflow questions, Reddit mentions)
- Historical growth trends
- Tool metadata (descriptions, categories, package names)

---

## Quick Start

### Prerequisites

- Node.js 18 or higher
- Claude Desktop app (or any MCP-compatible client)

### Installation

```bash
# Clone the repository
git clone https://github.com/grzetich/ai-developer-tools-mcp.git
cd ai-developer-tools-mcp

# Install dependencies
npm install

# (Optional) Copy and configure environment variables
cp .env.example .env
```

### Running the Server

**Option 1: Standalone Testing**

```bash
# Run the server in stdio mode
npm start

# Or run tests to verify all tools work
npm test
```

**Option 2: Connect to Claude Desktop**

Add this configuration to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ai-developer-tools": {
      "command": "node",
      "args": ["/absolute/path/to/ai-developer-tools-mcp/src/index.js"]
    }
  }
}
```

Restart Claude Desktop. You should see the server listed in the MCP section.

### Testing It Works

Ask Claude:
> _"What are the most popular AI coding tools right now?"_

Claude will use the `get_trending_tools` tool to fetch current data and present it to you.

---

## Architecture

### High-Level Flow

```
┌─────────┐          ┌─────────────┐          ┌──────────┐          ┌──────────┐
│  User   │  asks    │   Claude    │  calls   │   MCP    │  queries │   Data   │
│ (Human) │ ──────>  │ (AI Agent)  │ ──────>  │  Server  │ ──────>  │  Source  │
└─────────┘          └─────────────┘          └──────────┘          └──────────┘
                            │                       │                      │
                            │   <───────────────────┘                      │
                            │        Returns formatted                     │
                            │        text response                         │
                            │                                              │
                            │   <──────────────────────────────────────────┘
                            │         Presents insights
                            │         to user
```

### Components

1. **MCP Server (`src/index.js`)**
   - Implements the MCP protocol using the official SDK
   - Uses stdio transport for Claude Desktop integration
   - Handles tool registration and execution
   - Provides error handling and logging

2. **Tool Implementations (`src/tools/*.js`)**
   - `compare.js` - Compare 2-3 tools across multiple metrics
   - `trending.js` - Find fastest-growing tools by category
   - `history.js` - Retrieve historical adoption data
   - `search.js` - Search and filter tools by criteria

3. **Data Layer (`src/data/mock-data.js`)**
   - Mock data demonstrating real-world data structures
   - In production: Replace with database queries or API calls
   - Provides helper functions for calculations and filtering

### Why This Architecture?

**Stdio Transport**
We use stdio (standard input/output) rather than HTTP because:
- Simpler IPC mechanism - no network configuration needed
- Standard for Claude Desktop integration
- Secure - no open ports or authentication concerns
- Perfect for single-user, local tools

**Text-Based Responses**
Tools return formatted text rather than JSON because:
- Claude excels at working with natural language
- Easier for users to read when Claude shows results
- No parsing needed by the AI - it can directly quote or summarize
- More flexible - Claude can adapt the presentation to context

**Tool-Centric Design**
Each tool has a single, focused responsibility:
- Follows Unix philosophy: do one thing well
- Makes it easier for Claude to choose the right tool
- Simplifies testing and maintenance
- Clear separation of concerns

---

## Available Tools

### 1. `compare_tools`

**Description:** Compare adoption metrics between 2-3 AI developer tools

**Parameters:**
```typescript
{
  tools: string[];        // Array of 2-3 tool IDs ['openai', 'anthropic', 'cursor', 'copilot', 'langchain']
  time_range?: string;    // Time range: '7d', '30d', '90d' (default: '30d')
}
```

**Example Usage:**
```javascript
{
  "tools": ["openai", "anthropic"],
  "time_range": "30d"
}
```

**Returns:**
- NPM download comparison with growth indicators
- Community activity metrics (GitHub stars, SO questions, Reddit mentions)
- Key insights highlighting the leader and fastest-growing tool

---

### 2. `get_trending_tools`

**Description:** Get the fastest-growing AI developer tools ranked by growth rate

**Parameters:**
```typescript
{
  time_range?: string;    // '7d', '30d', '90d' (default: '30d')
  limit?: number;         // Max tools to return: 3-10 (default: 5)
  category?: string;      // Filter: 'llm-api', 'editor', 'assistant', 'framework', 'all' (default: 'all')
}
```

**Example Usage:**
```javascript
{
  "time_range": "30d",
  "limit": 5,
  "category": "llm-api"
}
```

**Returns:**
- Ranked list of tools by growth percentage
- Current download metrics
- Visual indicators for different growth levels (🔥 >50%, ⚡ >20%, 📈 others)

---

### 3. `get_tool_history`

**Description:** Get historical adoption data and growth trends for a specific tool

**Parameters:**
```typescript
{
  tool: string;           // Tool ID: 'openai', 'anthropic', 'cursor', 'copilot', 'langchain'
  months?: number;        // Number of months: 3-12 (default: 6)
}
```

**Example Usage:**
```javascript
{
  "tool": "cursor",
  "months": 6
}
```

**Returns:**
- Monthly download timeline
- Growth analysis (total growth, rate per month)
- Current metrics snapshot

---

### 4. `search_tools`

**Description:** Search and filter AI developer tools by various criteria

**Parameters:**
```typescript
{
  category?: string;      // 'llm-api', 'editor', 'assistant', 'framework'
  min_downloads?: number; // Minimum monthly downloads
  keyword?: string;       // Search in name or description
  sort_by?: string;       // 'downloads', 'stars', 'name' (default: 'downloads')
}
```

**Example Usage:**
```javascript
{
  "category": "llm-api",
  "min_downloads": 10000000,
  "sort_by": "downloads"
}
```

**Returns:**
- Filtered and sorted list of tools
- Full details for each tool (downloads, stars, community metrics)
- Summary statistics

---

## Design Decisions

### Tool Interface Design

**Why JSON Schema for Parameters?**
MCP uses JSON Schema to define tool parameters because:
- Claude can validate inputs before calling the tool
- Provides autocomplete/suggestions in supporting clients
- Self-documenting - the schema IS the documentation
- Type safety without TypeScript

**Why Enums for Known Values?**
We use enums (`enum: ['openai', 'anthropic', ...]`) instead of free text because:
- Prevents typos and invalid inputs
- Gives Claude a clear set of valid options
- Better UX - Claude knows exactly what values are acceptable
- Easier to maintain - add new tools in one place

### Error Handling Strategy

**Tool-Level Try/Catch**
Each tool execution is wrapped in a try/catch to ensure:
- One failing tool doesn't crash the entire server
- Claude receives error messages it can show to users
- Errors are logged for debugging but don't stop the conversation

**Example:**
```javascript
try {
  const result = await tool.execute(args);
  return { content: [{ type: 'text', text: result }] };
} catch (error) {
  console.error(`Error executing tool ${name}:`, error.message);
  return {
    content: [{ type: 'text', text: `Error: ${error.message}` }],
    isError: true
  };
}
```

### Response Formatting

**Why Text Instead of JSON?**
Tools return formatted text (with markdown) rather than JSON because:
- Claude is fundamentally a language model - it excels at text
- No parsing needed - Claude can directly quote, summarize, or reformat
- More flexible - Claude can adapt presentation to user preference
- Better for conversation - users see human-readable results

**Formatting Conventions:**
- Emoji sparingly for visual hierarchy (📊 📈 🔍)
- Markdown for structure (`**bold**`, bullets, code blocks)
- Growth indicators (↑ ↓ ↔) for quick scanning
- Timestamps for data freshness

### Authentication Approach

**Current:** No authentication (local-only, mock data)

**For Production:**
If connecting to real APIs or databases, consider:
- **API Keys:** Simple, stored in `.env`, passed in request headers
- **OAuth 2.0:** For user-specific data (see Vibe Data production implementation)
- **Rate Limiting:** Prevent abuse with per-user quotas
- **CORS/Origin Checks:** If exposing via HTTP transport

---

## What I Learned

### 1. **API Design vs. Tool Design Are Different**

When designing REST APIs, you optimize for developers:
- Detailed error codes (400, 401, 403, 404, 500)
- Structured JSON responses with nested objects
- Versioning (/v1/, /v2/)
- Comprehensive documentation with examples

When designing MCP tools for AI agents, you optimize for conversation:
- Descriptive error messages Claude can explain
- Formatted text responses that read naturally
- Simple, focused tools (not nested resources)
- Schema IS the documentation

**Key Insight:** Think "what would be easy for Claude to narrate?" rather than "what's the most efficient data structure?"

### 2. **Challenges in Tool Granularity**

One of the hardest decisions was: **Should I have one tool or many?**

**Option A:** Single `query_tools` tool with many parameters
❌ Pro: Flexible, fewer tools to maintain
❌ Con: Claude struggles to know when to use it, schema becomes complex

**Option B:** Many specific tools (`compare`, `trending`, `history`, `search`)
✅ Pro: Each tool has clear purpose, easier for Claude to select
✅ Con: More code, potential overlap

**Decision:** Go with specific tools. Claude performs better with clear, focused tools than with one mega-tool.

### 3. **Documentation for AI vs. Humans**

The `description` fields in tool schemas are more important than I initially thought:

**Bad Description:**
```javascript
description: 'Compare tools'  // Too vague
```

**Good Description:**
```javascript
description: 'Compare adoption metrics between 2-3 AI developer tools (e.g., OpenAI vs Anthropic SDK)'
```

Claude reads these descriptions to decide which tool to use. Including:
- What the tool does
- Example use case
- Key parameters

...makes Claude much more likely to choose the right tool for the user's query.

---

## Production Notes

**This is a reference implementation for educational purposes.**

For the production deployment at [vibe-data.com](https://vibe-data.com), the implementation includes:

- **Real Database Integration:** PostgreSQL with historical data going back to June 2022
- **Caching Layer:** Redis for frequently accessed metrics
- **Rate Limiting:** Tiered limits (10 queries/day free, 100/day Pro, unlimited Enterprise)
- **Authentication:** OAuth 2.1 + PKCE for user-specific features
- **Monitoring:** Error tracking, usage analytics, performance metrics
- **Multiple Data Sources:** NPM, GitHub, PyPI, Reddit, Stack Overflow, HackerNews, Twitter
- **Sentiment Analysis:** NLP-based analysis of developer discussions
- **API Endpoints:** REST API for web dashboard + MCP server for Claude
- **Automated Scraping:** Daily data collection with deduplication
- **Data Quality:** Schema validation, outlier detection, historical consistency checks

**Production Architecture Differences:**
- HTTP transport support for remote MCP clients
- Database connection pooling with SSL
- Graceful degradation when data sources are unavailable
- Comprehensive logging and alerting
- Horizontal scaling for high availability

If you're interested in using this professionally, check out [vibe-data.com/pricing](https://vibe-data.com/pricing) or [contact me](mailto:ed.grzetich@gmail.com).

---

## Development

### Project Structure

```
ai-developer-tools-mcp/
├── src/
│   ├── index.js           # Main MCP server
│   ├── data/
│   │   └── mock-data.js   # Simplified mock data
│   └── tools/
│       ├── compare.js     # Compare tools
│       ├── trending.js    # Trending tools
│       ├── history.js     # Historical data
│       └── search.js      # Search/filter tools
├── test/
│   └── test-tools.js      # Simple test suite
├── .env.example           # Environment template
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies
├── LICENSE               # MIT License
└── README.md             # This file
```

### Adding a New Tool

1. Create `src/tools/my-tool.js`:

```javascript
export const myTool = {
  name: 'my_tool_name',
  description: 'What this tool does and when to use it',

  inputSchema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'What this parameter does'
      }
    },
    required: ['param1']
  },

  async execute(args) {
    const { param1 } = args;
    // Your logic here
    return 'Formatted text response';
  }
};
```

2. Import in `src/index.js`:

```javascript
import { myTool } from './tools/my-tool.js';

const tools = [
  compareTool,
  trendingTool,
  historyTool,
  searchTool,
  myTool  // Add your tool
];
```

3. Test it:

```bash
npm test
```

### Extending with Real Data

To connect to a real data source:

1. Replace `src/data/mock-data.js` with real database queries or API calls
2. Add connection logic in a new `src/data/database.js`
3. Update tool implementations to call your data layer
4. Add environment variables for credentials
5. Implement caching if needed for performance

**Example with PostgreSQL:**

```javascript
// src/data/database.js
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function getCurrentMetrics(toolId) {
  const result = await pool.query(
    'SELECT * FROM latest_npm_stats WHERE package_name = $1',
    [toolId]
  );
  return result.rows[0];
}
```

---

## Contributing

Contributions welcome! This is an educational project, so quality over quantity.

**Good Contributions:**
- Additional tools with clear use cases
- Better mock data that demonstrates edge cases
- Documentation improvements
- Examples of using the server with different MCP clients
- Performance optimizations

**Please Open an Issue First** to discuss:
- Major architectural changes
- New dependencies
- Breaking changes to tool interfaces

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with the [Model Context Protocol](https://github.com/modelcontextprotocol) by Anthropic
- Inspired by real production data platform at [Vibe Data](https://vibe-data.com)
- Created as an educational resource for the AI developer community

---

## Author

**Ed Grzetich**
Building AI development intelligence at [Vibe Data](https://vibe-data.com)

- GitHub: [@grzetich](https://github.com/grzetich)
- Website: [vibe-data.com](https://vibe-data.com)
- Email: ed.grzetich@gmail.com

---

## Learn More

- [MCP Documentation](https://github.com/modelcontextprotocol/docs)
- [Claude Desktop MCP Setup](https://docs.anthropic.com/claude/docs/model-context-protocol)
- [Vibe Data Production Dashboard](https://vibe-data.com/dashboard)

---

**Questions? Issues? Ideas?**
[Open an issue](https://github.com/grzetich/ai-developer-tools-mcp/issues) or reach out!
