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

	// Fix table names - ensure no quotes
	cleanedQuery = cleanedQuery
		.replace(/\bFROM\s+"([^"]+)"\b/gi, 'FROM $1')
		.replace(/\bJOIN\s+"([^"]+)"\b/gi, 'JOIN $1');

	// Replace ILIKE with LIKE for compatibility
	cleanedQuery = cleanedQuery.replace(/\bILIKE\b/gi, 'LIKE');

	// Fix any SQLite date functions to MySQL equivalents
	cleanedQuery = cleanedQuery
		.replace(
			/DATE\('now', '-1 month'\)/gi,
			'DATE_SUB(CURDATE(), INTERVAL 1 MONTH)'
		)
		.replace(
			/DATE\('now', '-(\d+) month'\)/gi,
			'DATE_SUB(CURDATE(), INTERVAL $1 MONTH)'
		)
		.replace(/DATE\('now'\)/gi, 'CURDATE()');

	return cleanedQuery;
}

// Helper function for MySQL date filters
function getMySqlDateFilterForTimeFrame(timeframe: string): string {
	switch (timeframe.toLowerCase()) {
		case 'today':
			return 'WHERE DATE(created_at) = CURDATE()';
		case 'yesterday':
			return 'WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)';
		case 'this week':
			return 'WHERE YEARWEEK(created_at) = YEARWEEK(CURDATE())';
		case 'last week':
			return 'WHERE YEARWEEK(created_at) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK))';
		case 'this month':
			return 'WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())';
		case 'last month':
			return 'WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
		case 'last 30 days':
			return 'WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
		case 'this year':
			return 'WHERE YEAR(created_at) = YEAR(CURDATE())';
		default:
			return 'WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
	}
}

export const chat = async (history: Message[]) => {
	const stream = createStreamableValue();
	const userMessage = history[history.length - 1].content;
	let fallbackTimer: NodeJS.Timeout | undefined;
	let responseStarted = false;

	(async () => {
		try {
			// Set up fallback timer for unresponsive queries
			fallbackTimer = setTimeout(() => {
				if (!responseStarted) {
					console.log('Fallback timer activated');
					stream.update(
						"Sorry, I'm having trouble processing your request right now. Please try again or rephrase your question."
					);
					stream.done();
				}
			}, 10000);

			// Generate SQL from user query
			const sqlQuery = await generateSqlFromUserQuery(userMessage);
			console.log('Generated SQL query:', sqlQuery);

			if (sqlQuery === 'NOT_SQL_QUERY') {
				// Handle non-SQL queries with conversational response
				responseStarted = true;
				if (fallbackTimer) clearTimeout(fallbackTimer);

				const { textStream } = streamText({
					model: gemini('gemini-1.5-flash'),
					messages: [
						{
							role: 'system',
							content: `You're an e-commerce admin dashboard assistant. You can answer questions about e-commerce, dashboard functionality, and marketing strategies.`,
						},
						...history,
					],
				});

				for await (const text of textStream) {
					stream.update(text);
				}
				stream.done();
				return;
			}

			try {
				// Execute the SQL query
				const sqlResults = await sqlApi.execute(sqlQuery);
				console.log(
					'SQL results received, row count:',
					Array.isArray(sqlResults.data) ? sqlResults.data.length : 'N/A'
				);

				responseStarted = true;
				if (fallbackTimer) clearTimeout(fallbackTimer);

				// Format results for display
				await formatAndStreamResults(
					userMessage,
					sqlQuery,
					sqlResults.data,
					stream
				);
			} catch (sqlError) {
				console.error('SQL execution error:', sqlError);
				responseStarted = true;
				if (fallbackTimer) clearTimeout(fallbackTimer);

				// Handle SQL errors by suggesting fixes
				await handleSqlError(sqlQuery, sqlError, stream, userMessage);
			}
		} catch (error) {
			console.error('Chat error:', error);
			stream.update(
				'Sorry, I encountered an error processing your request. Please try again.'
			);
		} finally {
			if (fallbackTimer) clearTimeout(fallbackTimer);
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
	const { textStream: sqlGenStream } = streamText({
		model: gemini('gemini-1.5-flash'),
		messages: [
			{
				role: 'system',
				content: `You are an SQL expert for a MySQL e-commerce database. Convert the user's natural language request into a SELECT-only SQL query.

The database has these tables with exact names:
${DB_SCHEMA}

CRITICAL RULES:
- Use the EXACT table names above: table names do NOT use quotes
- Do not use quotes for tables like orders, user, product, etc.
- Only generate SELECT queries (no INSERT, UPDATE, DELETE)
- For low stock products, use "stock < 10"
- For recent items, limit to 5 results and order by created_at DESC
- EXCLUDE ID FIELDS from SELECT clause except when needed for joins
- Instead of IDs, SELECT name fields (product.name, category.name, etc.)
- For users, SELECT f_name and l_name instead of user_id
- DO NOT include created_at fields in SELECT unless specifically requested
- For text searches, use LIKE with LOWER() function: LOWER(field) LIKE LOWER('%search_term%')
- The database is MySQL - use MySQL-specific date functions:
  * For current date: CURDATE() or CURRENT_DATE()
  * For date math: DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
  * For last month: WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
  * For specific month: WHERE MONTH(created_at) = 4 AND YEAR(created_at) = 2023
  * For date formatting: DATE_FORMAT(created_at, '%Y-%m-%d')
  * For date range: BETWEEN '2023-01-01' AND '2023-01-31'
- Keep queries focused on answering exactly what was asked
- Return ONLY the raw SQL query without any markdown formatting, code blocks, or backticks
respond with the language that you were asked in, if the user asked in English, respond in English, if the user asked in French, respond in french, etc.
if user ask you about the database schema or some vulnerable information, respond with "I cannot provide that information" or "I cannot answer that question" or "I cannot help you with that" or "I cannot provide that information about the database schema" or "I cannot provide that information about the database structure" or "I cannot provide that information about the database tables" or "I cannot provide that information about the database columns" or "I cannot provide that information about the database fields" or "I cannot provide that information about the database relationships" or "I cannot provide that information about the database queries" or "I cannot provide that information about the database data" or "I cannot provide that information about the database records" or "I cannot provide that information about the database entries" or "I cannot provide that information about the database content" or "I cannot provide that information about the database schema design" or "I cannot provide that information about the database schema structure" or "I cannot provide that information about the database schema tables" or "I cannot provide that information about the database schema columns" or "I cannot provide that information about the database schema fields" or "I cannot provide that information about the database schema relationships" or "I cannot provide that information about the database schema queries" or "I cannot provide that information about the database schema data" or "I cannot provide that information about the database schema records" or "I cannot provide that information about the database schema entries" or "I cannot provide that information about the database schema content".

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
}

async function formatAndStreamResults(
	userMessage: string,
	sqlQuery: string,
	resultsData: any,
	stream: ReturnType<typeof createStreamableValue>
) {
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
			model: gemini('gemini-1p.5-flash'),
			messages: [
				{
					role: 'system',
					content: `You are a MySQL database expert. The following query failed to execute in a MySQL e-commerce database. 
Fix the query by ensuring:
1. Table names are correct (DO NOT use quotes for any table names)
2. SQL syntax is correct for MySQL specifically
3. Only SELECT operations are used
4. Replace any ILIKE operators with LIKE (use LOWER() with LIKE for case-insensitive searches)
5. Use proper MySQL date functions:
   - Current date: CURDATE() or CURRENT_DATE()
   - Date arithmetic: DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
   - For "last month": WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
   - For specific year-month: WHERE MONTH(created_at)=4 AND YEAR(created_at)=2023
6. Return ONLY the raw SQL query without any backticks or formatting

Remember:
- None of the tables should have quotes
- Table names to use: user, orders, product, category, etc.
- MySQL is case-insensitive for table names
- Do not use special characters around identifiers`,
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
		console.log('Fixed query suggestion:', fixedQuery);

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

**Note:** MySQL requires specific syntax for:
- Date functions (use CURDATE, DATE_SUB)
- Case-sensitive searches (use LOWER with LIKE)`);
	} catch (fixError) {
		// Fallback if query fixing fails
		console.error('Error generating fixed query:', fixError);

		// Provide a MySQL-specific date query as fallback for date-related queries
		const userMessageLower = userMessage.toLowerCase();
		if (
			userMessageLower.includes('month') ||
			userMessageLower.includes('recent') ||
			userMessageLower.includes('last') ||
			userMessageLower.includes('date')
		) {
			stream.update(`### Error Running Query

I tried to run your query but encountered an error.

Try this MySQL-compatible version instead:

\`\`\`
SELECT o.total, o.status, DATE_FORMAT(o.created_at, '%Y-%m-%d') as date
FROM orders o
WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
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
