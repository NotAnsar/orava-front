'use server';

import { streamText } from 'ai';
import { gemini } from '@/lib/gemini';
import { createStreamableValue } from 'ai/rsc';
import { Message } from '@/components/chat/LiveChatBot';
import { sqlApi } from './dashboardApi';

// Database table structure for prompt context
const DB_SCHEMA = `
1. product: id, name, price, stock, category_id, description, archived, featured, color_id, size_id, created_at
2. category: id, name, created_at
3. orders: id, user_id, created_at, total, status
4. order_items: id, created_at, order_id, product_id, quantity, unit_price
5. user: id, created_at, f_name, l_name, email, password, role
6. colors: id, name, value
7. sizes: id, name, created_at, fullname
`;

// Clean SQL query from markdown and formatting artifacts
function cleanSqlQuery(query: string): string {
	if (query === 'NOT_SQL_QUERY') return query;

	let cleanedQuery = query
		.trim()
		.replace(/```sql\n?/g, '')
		.replace(/```/g, '')
		.replace(/\\n/g, ' ')
		.trim();

	// Fix table names - ensure no quotes except for user table
	cleanedQuery = cleanedQuery
		.replace(/\bFROM\s+"([^"]+)"\b/gi, (match, tableName) => {
			return tableName.toLowerCase() === 'user'
				? `FROM "user"`
				: `FROM ${tableName}`;
		})
		.replace(/\bJOIN\s+"([^"]+)"\b/gi, (match, tableName) => {
			return tableName.toLowerCase() === 'user'
				? `JOIN "user"`
				: `JOIN ${tableName}`;
		});

	// Ensure user table is always quoted
	cleanedQuery = cleanedQuery
		.replace(/\bFROM\s+user\b/gi, 'FROM "user"')
		.replace(/\bJOIN\s+user\b/gi, 'JOIN "user"');

	// Fix any MySQL date functions to PostgreSQL equivalents
	cleanedQuery = cleanedQuery
		.replace(
			/DATE_SUB\(CURDATE\(\), INTERVAL 1 MONTH\)/gi,
			"created_at >= CURRENT_DATE - INTERVAL '1 month'"
		)
		.replace(
			/DATE_SUB\(CURDATE\(\), INTERVAL (\d+) MONTH\)/gi,
			"created_at >= CURRENT_DATE - INTERVAL '$1 month'"
		)
		.replace(
			/DATE_SUB\(CURDATE\(\), INTERVAL (\d+) DAY\)/gi,
			"created_at >= CURRENT_DATE - INTERVAL '$1 day'"
		)
		.replace(/CURDATE\(\)/gi, 'CURRENT_DATE')
		.replace(/CURRENT_DATE\(\)/gi, 'CURRENT_DATE')
		.replace(/YEARWEEK\(/gi, 'EXTRACT(WEEK FROM ')
		.replace(/MONTH\(/gi, 'EXTRACT(MONTH FROM ')
		.replace(/YEAR\(/gi, 'EXTRACT(YEAR FROM ')
		.replace(/DATE_FORMAT\(/gi, 'TO_CHAR(');

	// Fix SQLite date functions to PostgreSQL equivalents
	cleanedQuery = cleanedQuery
		.replace(/DATE\('now', '-1 month'\)/gi, "CURRENT_DATE - INTERVAL '1 month'")
		.replace(
			/DATE\('now', '-(\d+) month'\)/gi,
			"CURRENT_DATE - INTERVAL '$1 month'"
		)
		.replace(/DATE\('now'\)/gi, 'CURRENT_DATE');

	return cleanedQuery;
}

export async function chat(history: Message[]) {
	try {
		console.log('=== CHAT FUNCTION STARTED ===');

		const stream = createStreamableValue();

		// Basic validation
		if (!history || history.length === 0) {
			stream.update('**ERROR:** No message history provided');
			stream.done();
			return {
				messages: history || [],
				newMessage: stream.value,
			};
		}

		const userMessage = history[history.length - 1]?.content;
		if (!userMessage) {
			stream.update('**ERROR:** No user message found');
			stream.done();
			return {
				messages: history,
				newMessage: stream.value,
			};
		}

		let fallbackTimer: NodeJS.Timeout | undefined;
		let responseStarted = false;

		// Start the async processing
		(async () => {
			try {
				console.log('=== ASYNC PROCESSING STARTED ===');

				fallbackTimer = setTimeout(() => {
					if (!responseStarted) {
						console.log('TIMEOUT: Fallback timer activated');
						stream.update(
							'Request timeout. Please try again with a simpler question.'
						);
						stream.done();
					}
				}, 25000);

				let sqlQuery;
				try {
					console.log('About to call generateSqlFromUserQuery');
					sqlQuery = await generateSqlFromUserQuery(userMessage);
					console.log('generateSqlFromUserQuery completed:', sqlQuery);
				} catch (sqlGenError: any) {
					console.error('SQL Generation Error:', sqlGenError);
					responseStarted = true;
					if (fallbackTimer) clearTimeout(fallbackTimer);

					stream.update(
						`I had trouble understanding your request. Could you please rephrase it? For example:\n\n- "Show me products with low stock"\n- "What are my recent orders?"\n- "Which products sell the most?"`
					);
					stream.done();
					return;
				}

				if (sqlQuery === 'NOT_SQL_QUERY') {
					console.log('Non-SQL query detected, using fallback response');
					responseStarted = true;
					if (fallbackTimer) clearTimeout(fallbackTimer);

					// Instead of using AI, provide a helpful fallback
					stream.update(`I can help you analyze your e-commerce data! Here are some things you can ask me:

**📊 Product Analytics:**
- "Which products are low on stock?"
- "Show me all products"
- "What are the featured products?"

**🛍️ Order Information:**
- "Show me recent orders"
- "What orders were placed today?"
- "Show me pending orders"

**👥 Customer Data:**
- "List all customers"
- "Show me customer information"

**📈 Business Insights:**
- "What are the top-selling products?"
- "Show me sales from last month"

Try asking me one of these questions!`);

					stream.done();
					return;
				}

				// SQL query processing
				console.log('Processing SQL query...');
				console.log('query :', sqlQuery);

				try {
					const sqlResults = await sqlApi.execute(sqlQuery);
					responseStarted = true;
					if (fallbackTimer) clearTimeout(fallbackTimer);

					console.log('SQL executed successfully');
					await formatAndStreamResults(
						userMessage,
						sqlQuery,
						sqlResults.data,
						stream
					);
				} catch (sqlError: any) {
					responseStarted = true;
					if (fallbackTimer) clearTimeout(fallbackTimer);

					console.error('SQL execution error:', sqlError);
					stream.update(`I had trouble running that query. Here are some example queries you can try:

**📦 Inventory:**
- "Which products are low on stock?"
- "Show me all products"

**📋 Orders:**
- "Show me recent orders"
- "What orders do I have?"

**👤 Customers:**
- "List all customers"
- "Show customer information"

Please try one of these!`);
					stream.done();
				}
			} catch (asyncError: any) {
				console.error('=== ASYNC PROCESSING ERROR ===', asyncError);

				if (!responseStarted) {
					stream.update(`I'm having some technical difficulties. Please try asking a simple question like:

- "Show me all products"
- "Which products are low on stock?"
- "Show me recent orders"

Sorry for the inconvenience!`);
				}
				stream.done();
			} finally {
				console.log('=== ASYNC PROCESSING CLEANUP ===');
				if (fallbackTimer) clearTimeout(fallbackTimer);
				if (!responseStarted) {
					console.log('No response started, providing fallback');
					stream.update(
						'Hello! I can help you analyze your e-commerce data. What would you like to know?'
					);
				}
				stream.done();
			}
		})();

		console.log('=== RETURNING FROM CHAT FUNCTION ===');
		return {
			messages: history,
			newMessage: stream.value,
		};
	} catch (outerError: any) {
		console.error('=== OUTER CHAT ERROR ===', outerError);

		// Last resort error handling
		try {
			const stream = createStreamableValue();
			stream.update(`Hello! I'm your dashboard assistant. I can help you with:

- Product inventory analysis
- Order management  
- Customer information
- Sales reports

What would you like to know about your business?`);
			stream.done();

			return {
				messages: history || [],
				newMessage: stream.value,
			};
		} catch (finalError) {
			console.error('=== FINAL ERROR ===', finalError);
			throw outerError;
		}
	}
}

// Generate SQL query from user's natural language request
async function generateSqlFromUserQuery(userMessage: string): Promise<string> {
	try {
		console.log('generateSqlFromUserQuery: Starting, message:', userMessage);

		if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
			throw new Error(
				'Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable'
			);
		}

		console.log(
			'generateSqlFromUserQuery: API key exists, creating textStream'
		);

		const { textStream: sqlGenStream } = streamText({
			model: gemini('gemini-1.5-flash'),
			messages: [
				{
					role: 'system',
					content: `You are an SQL expert for a PostgreSQL e-commerce database. Convert the user's natural language request into a SELECT-only SQL query.

The database has these tables with exact names:
${DB_SCHEMA}

CRITICAL RULES:
- The "user" table MUST be quoted as "user" because PostgreSQL has a built-in user table
- Other table names (orders, product, category, etc.) do NOT use quotes
- Only generate SELECT queries (no INSERT, UPDATE, DELETE)
- For low stock products, use "stock < 10"
- For recent items, limit to 5 results and order by created_at DESC
- EXCLUDE ID FIELDS from SELECT clause except when needed for joins
- Instead of IDs, SELECT name fields (product.name, category.name, etc.)
- For users, SELECT f_name and l_name instead of user_id
- DO NOT include created_at fields in SELECT unless specifically requested
- For text searches, use ILIKE for case-insensitive searches: field ILIKE '%search_term%'
- Keep queries focused on answering exactly what was asked
- Return ONLY the raw SQL query without any markdown formatting, code blocks, or backticks

If the user's request isn't related to database queries, return "NOT_SQL_QUERY" instead.`,
				},
				{ role: 'user', content: userMessage },
			],
			maxTokens: 200,
			temperature: 0.1,
		});

		console.log('generateSqlFromUserQuery: textStream created, processing...');

		let sqlQuery = '';
		for await (const text of sqlGenStream) {
			sqlQuery += text;
		}

		console.log('generateSqlFromUserQuery: Raw SQL query:', sqlQuery);

		const cleanedQuery = cleanSqlQuery(sqlQuery);
		console.log('generateSqlFromUserQuery: Cleaned SQL query:', cleanedQuery);

		return cleanedQuery;
	} catch (error: any) {
		console.error('generateSqlFromUserQuery: Error occurred:', error);
		const enhancedError = new Error(`SQL Generation failed: ${error.message}`);
		enhancedError.cause = error;
		throw enhancedError;
	}
}

async function formatAndStreamResults(
	userMessage: string,
	sqlQuery: string,
	resultsData: any,
	stream: ReturnType<typeof createStreamableValue>
) {
	try {
		// Simple formatting without AI - just show the data directly
		let formattedResponse = '';

		if (
			!resultsData ||
			(Array.isArray(resultsData) && resultsData.length === 0)
		) {
			formattedResponse =
				"**No Results Found**\n\nYour query didn't return any data. This could mean:\n- The data doesn't exist\n- Try a different search term\n- Check your filters";
		} else if (Array.isArray(resultsData)) {
			// Create a nice header based on the query
			if (sqlQuery.toLowerCase().includes('stock')) {
				formattedResponse = `**📦 Inventory Status**\n\nFound ${resultsData.length} products:\n\n`;
			} else if (sqlQuery.toLowerCase().includes('order')) {
				formattedResponse = `**🛍️ Orders**\n\nFound ${resultsData.length} orders:\n\n`;
			} else if (sqlQuery.toLowerCase().includes('user')) {
				formattedResponse = `**👥 Customers**\n\nFound ${resultsData.length} customers:\n\n`;
			} else {
				formattedResponse = `**📊 Results**\n\nFound ${resultsData.length} records:\n\n`;
			}

			resultsData.slice(0, 10).forEach((item, index) => {
				if (typeof item === 'object') {
					const values = Object.values(item)
						.filter((val) => val !== null)
						.join(' | ');
					formattedResponse += `• ${values}\n`;
				} else {
					formattedResponse += `• ${item}\n`;
				}
			});

			if (resultsData.length > 10) {
				formattedResponse += `\n*... and ${
					resultsData.length - 10
				} more results*`;
			}
		} else {
			formattedResponse = `**Result:** ${JSON.stringify(resultsData)}`;
		}

		stream.update(formattedResponse);
		stream.done(); // IMPORTANT: Close the stream after updating
	} catch (error: any) {
		stream.update(`**Results:** ${JSON.stringify(resultsData, null, 2)}`);
		stream.done(); // IMPORTANT: Close the stream even on error
	}
}
