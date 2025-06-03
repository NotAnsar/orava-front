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

	// Keep ILIKE for PostgreSQL (case-insensitive search)
	// cleanedQuery = cleanedQuery.replace(/\bILIKE\b/gi, 'LIKE'); // Removed for PostgreSQL

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

// Helper function for PostgreSQL date filters
function getPostgreSqlDateFilterForTimeFrame(timeframe: string): string {
	switch (timeframe.toLowerCase()) {
		case 'today':
			return 'WHERE DATE(created_at) = CURRENT_DATE';
		case 'yesterday':
			return "WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'";
		case 'this week':
			return 'WHERE EXTRACT(WEEK FROM created_at) = EXTRACT(WEEK FROM CURRENT_DATE)';
		case 'last week':
			return "WHERE EXTRACT(WEEK FROM created_at) = EXTRACT(WEEK FROM CURRENT_DATE - INTERVAL '1 week')";
		case 'this month':
			return 'WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)';
		case 'last month':
			return "WHERE created_at >= CURRENT_DATE - INTERVAL '1 month'";
		case 'last 30 days':
			return "WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'";
		case 'this year':
			return 'WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)';
		default:
			return "WHERE created_at >= CURRENT_DATE - INTERVAL '1 month'";
	}
}

export const chat = async (history: Message[]) => {
	const stream = createStreamableValue();
	const userMessage = history[history.length - 1].content;
	let fallbackTimer: NodeJS.Timeout | undefined;
	let responseStarted = false;

	// Show debug info as response
	let debugInfo = `**DEBUG INFO:**\n`;
	debugInfo += `- Environment: ${process.env.NODE_ENV}\n`;
	debugInfo += `- User message: "${userMessage}"\n`;
	debugInfo += `- API Key exists: ${!!process.env
		.GOOGLE_GENERATIVE_AI_API_KEY}\n`;
	debugInfo += `- API Key length: ${
		process.env.GOOGLE_GENERATIVE_AI_API_KEY?.length || 0
	}\n`;
	debugInfo += `- Runtime: ${process.env.VERCEL ? 'Vercel' : 'Local'}\n\n`;

	(async () => {
		try {
			fallbackTimer = setTimeout(() => {
				if (!responseStarted) {
					stream.update(
						debugInfo + '**ERROR:** Request timeout after 25 seconds'
					);
					stream.done();
				}
			}, 25000);

			debugInfo += `**STEP 1:** Starting SQL generation...\n`;

			let sqlQuery;
			try {
				sqlQuery = await generateSqlFromUserQuery(userMessage);
				debugInfo += `**STEP 2:** SQL generation successful: "${sqlQuery}"\n`;
			} catch (sqlGenError: any) {
				responseStarted = true;
				if (fallbackTimer) clearTimeout(fallbackTimer);

				const errorDetails = `
**SQL GENERATION ERROR:**
- Error type: ${sqlGenError?.constructor?.name || 'Unknown'}
- Error message: ${sqlGenError?.message || 'No message'}
- Error code: ${sqlGenError?.code || 'No code'}
- Error status: ${sqlGenError?.status || 'No status'}
- Error digest: ${sqlGenError?.digest || 'No digest'}
- Full error: ${JSON.stringify(
					sqlGenError,
					Object.getOwnPropertyNames(sqlGenError),
					2
				)}
                `;

				stream.update(debugInfo + errorDetails);
				stream.done();
				return;
			}

			if (sqlQuery === 'NOT_SQL_QUERY') {
				debugInfo += `**STEP 3:** Processing conversational query...\n`;
				responseStarted = true;
				if (fallbackTimer) clearTimeout(fallbackTimer);

				try {
					debugInfo += `**STEP 4:** Creating text stream...\n`;

					const { textStream } = streamText({
						model: gemini('gemini-1.5-flash'),
						messages: [
							{
								role: 'system',
								content: `You're an e-commerce admin dashboard assistant. You can answer questions about e-commerce, dashboard functionality, and marketing strategies. Keep responses brief and helpful.`,
							},
							...history,
						],
					});

					debugInfo += `**STEP 5:** Text stream created, processing response...\n`;
					stream.update(debugInfo + `**RESPONSE:**\n`);

					let hasContent = false;
					let responseText = '';

					for await (const text of textStream) {
						if (text && text.trim()) {
							hasContent = true;
							responseText += text;
							stream.update(debugInfo + `**RESPONSE:**\n${responseText}`);
						}
					}

					if (!hasContent) {
						stream.update(
							debugInfo +
								`**RESPONSE:**\nHello! How can I help you with your e-commerce dashboard today?`
						);
					}
				} catch (conversationError: any) {
					const errorDetails = `
**CONVERSATION ERROR:**
- Error type: ${conversationError?.constructor?.name || 'Unknown'}
- Error message: ${conversationError?.message || 'No message'}
- Error code: ${conversationError?.code || 'No code'}
- Error status: ${conversationError?.status || 'No status'}
- Error digest: ${conversationError?.digest || 'No digest'}
- API Key in error context: ${!!process.env.GOOGLE_GENERATIVE_AI_API_KEY}
- Vercel region: ${process.env.VERCEL_REGION || 'unknown'}
- Full error: ${JSON.stringify(
						conversationError,
						Object.getOwnPropertyNames(conversationError),
						2
					)}
                    `;

					stream.update(debugInfo + errorDetails);
				}

				stream.done();
				return;
			}

			// SQL query processing
			debugInfo += `**STEP 6:** Processing SQL query...\n`;
			try {
				const sqlResults = await sqlApi.execute(sqlQuery);
				responseStarted = true;
				if (fallbackTimer) clearTimeout(fallbackTimer);

				debugInfo += `**STEP 7:** SQL executed successfully\n`;
				await formatAndStreamResults(
					userMessage,
					sqlQuery,
					sqlResults.data,
					stream
				);
			} catch (sqlError: any) {
				responseStarted = true;
				if (fallbackTimer) clearTimeout(fallbackTimer);

				const errorDetails = `
**SQL EXECUTION ERROR:**
- Error message: ${sqlError?.message || 'No message'}
- Full error: ${JSON.stringify(
					sqlError,
					Object.getOwnPropertyNames(sqlError),
					2
				)}
                `;

				stream.update(debugInfo + errorDetails);
			}
		} catch (mainError: any) {
			const errorDetails = `
**MAIN CHAT ERROR:**
- Error type: ${mainError?.constructor?.name || 'Unknown'}
- Error message: ${mainError?.message || 'No message'}
- Error code: ${mainError?.code || 'No code'}
- Error status: ${mainError?.status || 'No status'}
- Error stack: ${mainError?.stack || 'No stack'}
- Full error: ${JSON.stringify(
				mainError,
				Object.getOwnPropertyNames(mainError),
				2
			)}
            `;

			if (!responseStarted) {
				stream.update(debugInfo + errorDetails);
			}
		} finally {
			if (fallbackTimer) clearTimeout(fallbackTimer);
			if (!responseStarted) {
				stream.update(
					debugInfo +
						`**FALLBACK:** No response started, providing default response`
				);
			}
			stream.done();
		}
	})();

	return {
		messages: history,
		newMessage: stream.value,
	};
};

// Generate SQL query from user's natural language request
async function generateSqlFromUserQuery(userMessage: string): Promise<string> {
	try {
		// Test if gemini function works
		if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
			throw new Error(
				'Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable'
			);
		}

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
- For finding users who never bought products, use: SELECT u.f_name, u.l_name FROM "user" u LEFT JOIN orders o ON u.id = o.user_id WHERE o.user_id IS NULL
- For finding records that don't exist in related tables, use LEFT JOIN with WHERE IS NULL instead of EXCEPT
- The database is PostgreSQL - use PostgreSQL-specific date functions:
  * For current date: CURRENT_DATE
  * For date math: CURRENT_DATE - INTERVAL '1 month'
  * For last month: WHERE created_at >= CURRENT_DATE - INTERVAL '1 month'
  * For specific month: WHERE EXTRACT(MONTH FROM created_at) = 4 AND EXTRACT(YEAR FROM created_at) = 2023
  * For date formatting: TO_CHAR(created_at, 'YYYY-MM-DD')
  * For date range: BETWEEN '2023-01-01' AND '2023-01-31'
  * For week extraction: EXTRACT(WEEK FROM created_at)
  * For month extraction: EXTRACT(MONTH FROM created_at)
  * For year extraction: EXTRACT(YEAR FROM created_at)
- Keep queries focused on answering exactly what was asked
- Return ONLY the raw SQL query without any markdown formatting, code blocks, or backticks

respond with the language that you were asked in, if the user asked in English, respond in English, if the user asked in French, respond in french, etc.
if user ask you about the database schema or some vulnerable information, respond with "I cannot provide that information" or "I cannot answer that question" or "I cannot help you with that" or "I cannot provide that information about the database schema" or "I cannot provide that information about the database structure" or "I cannot provide that information about the database tables" or "I cannot provide that information about the database columns" or "I cannot provide that information about the database fields" or "I cannot provide that information about the database relationships" or "I cannot provide that information about the database queries" or "I cannot provide that information about the database data" or "I cannot provide that information about the database records" or "I cannot provide that information about the database entries" or "I cannot provide that information about the database content" or "I cannot provide that information about the database schema design" or "I cannot provide that information about the database schema structure" or "I cannot provide that information about the database schema tables" or "I cannot provide that information about the database schema columns" or "I cannot provide that information about the database schema fields" or "I cannot provide that information about the database relationships" or "I cannot provide that information about the database queries" or "I cannot provide that information about the database data" or "I cannot provide that information about the database records" or "I cannot provide that information about the database entries" or "I cannot provide that information about the database content".

If the user's request isn't related to database queries, return "NOT_SQL_QUERY" instead.`,
				},
				{ role: 'user', content: userMessage },
			],
		});

		let sqlQuery = '';
		for await (const text of sqlGenStream) {
			sqlQuery += text;
		}

		return cleanSqlQuery(sqlQuery);
	} catch (error: any) {
		// Re-throw with more context
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
		const { textStream: formattingStream } = streamText({
			model: gemini('gemini-1.5-flash'),
			messages: [
				{
					role: 'system',
					content: `You're an e-commerce data analyst. Format these SQL query results into a clear, readable response optimized for a small mobile chat window (max-width: 400px).

1. Start with a brief, bold headline summarizing the data
2. Use concise text with short paragraphs (1-2 lines max)
3. Use markdown formatting:
   - **Bold** for important data points
   - Use dashes (-) not asterisks (*) for bullet lists
   - Use short bullet items with a dash followed by a space
   - Keep bullet lists clean without extra line breaks
   - Short, clear headings with ## or ### (not #)
   - Add spacing between sections
4. EXCLUDE any database IDs from your response - don't show "id", "user_id", etc.
5. Format dates in a user-friendly way (e.g., "May 21, 2023")
6. Limit lists to 5-7 items max even if more data exists
7. DO NOT include the SQL query in your response
8. NEVER use asterisks (*) as bullet points, always use dashes (-)

For data presentation:
- For empty results: Brief explanation + possible reason
- For 1-5 items: Show each with dashes (-) as bullet points
- For >5 items: Show highlights and summarize trends

Use markdown and keep formatting compact to fit a small mobile screen.`,
				},
				{
					role: 'user',
					content: `The user asked: "${userMessage}"

SQL Query:
${sqlQuery}

Results: 
${JSON.stringify(resultsData)}`,
				},
			],
		});

		let hasContent = false;
		for await (const text of formattingStream) {
			if (text && text.trim()) hasContent = true;
			stream.update(text);
		}

		// Provide fallback if no content was generated
		if (!hasContent) {
			stream.update(
				"I found some data matching your request, but I'm having trouble formatting the results. Here's a basic summary: " +
					`${
						Array.isArray(resultsData) ? resultsData.length : 0
					} records were found.`
			);
		}
	} catch (error: any) {
		stream.update(`**FORMATTING ERROR:**
- Error: ${error.message}
- Raw data: ${JSON.stringify(resultsData).substring(0, 200)}...`);
	}
}

// Handle SQL errors and suggest fixes
async function handleSqlError(
	sqlQuery: string,
	sqlError: any,
	stream: ReturnType<typeof createStreamableValue>,
	userMessage: string = ''
) {
	try {
		const { textStream: fixQueryStream } = streamText({
			model: gemini('gemini-1.5-flash'),
			messages: [
				{
					role: 'system',
					content: `You are a PostgreSQL database expert. The following query failed to execute in a PostgreSQL e-commerce database. 
Fix the query by ensuring:
1. The "user" table MUST be quoted as "user" because PostgreSQL has a built-in user table
2. Other table names (orders, product, category, etc.) should NOT have quotes
3. SQL syntax is correct for PostgreSQL specifically
4. Only SELECT operations are used
5. Use ILIKE for case-insensitive text searches
6. For finding records that don't match, use LEFT JOIN with WHERE IS NULL instead of EXCEPT
7. Use proper PostgreSQL date functions:
   - Current date: CURRENT_DATE
   - Date arithmetic: CURRENT_DATE - INTERVAL '1 month'
   - For "last month": WHERE created_at >= CURRENT_DATE - INTERVAL '1 month'
   - For specific year-month: WHERE EXTRACT(MONTH FROM created_at)=4 AND EXTRACT(YEAR FROM created_at)=2023
   - For date formatting: TO_CHAR(created_at, 'YYYY-MM-DD')
   - For extracting parts: EXTRACT(MONTH FROM created_at), EXTRACT(YEAR FROM created_at)
8. Return ONLY the raw SQL query without any backticks or formatting

Remember:
- "user" table must be quoted: "user"
- Other tables without quotes: orders, product, category, colors, sizes, order_items
- PostgreSQL is case-sensitive for identifiers by default
- Use ILIKE for case-insensitive searches`,
				},
				{
					role: 'user',
					content: `Failed query: ${sqlQuery}
Error: ${JSON.stringify(sqlError)}

Fixed query:`,
				},
			],
		});

		let fixedQuery = '';
		for await (const text of fixQueryStream) {
			fixedQuery += text;
		}

		fixedQuery = cleanSqlQuery(fixedQuery);

		// Show helpful error message with fixed query suggestion
		const errorMessage =
			typeof sqlError === 'object' && sqlError !== null && 'message' in sqlError
				? sqlError.message
				: JSON.stringify(sqlError).substring(0, 100);

		stream.update(`### Error Running Query

I tried to run this query but encountered an issue:

\`\`\`
${sqlQuery}
\`\`\`

**Error:** ${errorMessage}

### Suggested Fix

Try this corrected version:

\`\`\`
${fixedQuery}
\`\`\`

**Note:** PostgreSQL requires specific syntax for:
- Date functions (use CURRENT_DATE, INTERVAL)
- Case-insensitive searches (use ILIKE)
- Date extraction (use EXTRACT function)`);
	} catch (fixError) {
		// Fallback if query fixing fails
		console.error('Error generating fixed query:', fixError);

		// Provide a PostgreSQL-specific date query as fallback for date-related queries
		const userMessageLower = userMessage.toLowerCase();
		if (
			userMessageLower.includes('month') ||
			userMessageLower.includes('recent') ||
			userMessageLower.includes('last') ||
			userMessageLower.includes('date')
		) {
			stream.update(`### Error Running Query

I tried to run your query but encountered an error.

Try this PostgreSQL-compatible version instead:

\`\`\`
SELECT o.total, o.status, TO_CHAR(o.created_at, 'YYYY-MM-DD') as date
FROM orders o
WHERE o.created_at >= CURRENT_DATE - INTERVAL '1 month'
ORDER BY o.created_at DESC
LIMIT 20
\`\`\`

This should show you orders from the last month.`);
		} else {
			stream.update(`### Error Running Query

I tried to run this SQL query but encountered an error:

\`\`\`
${sqlQuery}
\`\`\`

**Error:** ${
				typeof sqlError === 'object' && sqlError !== null
					? sqlError.message || JSON.stringify(sqlError).substring(0, 100)
					: 'Unknown SQL error'
			}

Try simplifying your request or using different search terms.`);
		}
	}
}
