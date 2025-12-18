/**
 * Simple test file to verify all tools work correctly
 *
 * This is not a comprehensive test suite, but a quick sanity check
 * to ensure all tools can execute without errors.
 *
 * Run with: npm test
 */

import { compareTool } from '../src/tools/compare.js';
import { trendingTool } from '../src/tools/trending.js';
import { historyTool } from '../src/tools/history.js';
import { searchTool } from '../src/tools/search.js';

async function testTools() {
  console.log('🧪 Testing AI Developer Tools MCP Server\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Compare Tool
  console.log('1️⃣ Testing compare_tools...');
  try {
    const result = await compareTool.execute({
      tools: ['openai', 'anthropic'],
      time_range: '30d'
    });
    if (result.includes('Comparison') && result.includes('OpenAI SDK')) {
      console.log('✅ Compare tool works');
      console.log(`   Preview: ${result.substring(0, 100)}...\n`);
      passed++;
    } else {
      console.log('❌ Compare tool returned unexpected data\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Compare tool error: ${error.message}\n`);
    failed++;
  }

  // Test 2: Trending Tool
  console.log('2️⃣ Testing get_trending_tools...');
  try {
    const result = await trendingTool.execute({
      time_range: '30d',
      limit: 5
    });
    if (result.includes('Trending') && result.includes('Fastest Growing')) {
      console.log('✅ Trending tool works');
      console.log(`   Preview: ${result.substring(0, 100)}...\n`);
      passed++;
    } else {
      console.log('❌ Trending tool returned unexpected data\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Trending tool error: ${error.message}\n`);
    failed++;
  }

  // Test 3: History Tool
  console.log('3️⃣ Testing get_tool_history...');
  try {
    const result = await historyTool.execute({
      tool: 'cursor',
      months: 6
    });
    if (result.includes('Historical Adoption') && result.includes('Growth Analysis')) {
      console.log('✅ History tool works');
      console.log(`   Preview: ${result.substring(0, 100)}...\n`);
      passed++;
    } else {
      console.log('❌ History tool returned unexpected data\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ History tool error: ${error.message}\n`);
    failed++;
  }

  // Test 4: Search Tool
  console.log('4️⃣ Testing search_tools...');
  try {
    const result = await searchTool.execute({
      category: 'llm-api',
      min_downloads: 5_000_000
    });
    if (result.includes('Search Results') && result.includes('Found')) {
      console.log('✅ Search tool works');
      console.log(`   Preview: ${result.substring(0, 100)}...\n`);
      passed++;
    } else {
      console.log('❌ Search tool returned unexpected data\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ Search tool error: ${error.message}\n`);
    failed++;
  }

  // Summary
  console.log('═══════════════════════════════════════');
  console.log(`✅ Passed: ${passed}/4`);
  console.log(`❌ Failed: ${failed}/4`);

  if (failed === 0) {
    console.log('\n🎉 All tools working correctly!');
    console.log('\nNext step: Start the MCP server');
    console.log('  npm start');
  } else {
    console.log('\n⚠️  Some tools failed. Check the error messages above.');
  }

  process.exit(failed > 0 ? 1 : 0);
}

testTools().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
