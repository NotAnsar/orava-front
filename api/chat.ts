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

		// Display the debug message you requested
		stream.update(`=== CHAT FUNCTION STARTED ===
=== ASYNC PROCESSING STARTED ===`);

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
						stream.update('Request timeout. Please try again.');
						stream.done();
					}
				}, 25000);

				// Update stream with debug info
				stream.update(`=== CHAT FUNCTION STARTED ===
=== ASYNC PROCESSING STARTED ===
About to call generateSqlFromUserQuery`);

				let sqlQuery;
				try {
					console.log('About to call generateSqlFromUserQuery');
					sqlQuery = await generateSqlFromUserQuery(userMessage);
					console.log('generateSqlFromUserQuery completed:', sqlQuery);

					// Update stream with more debug info
					stream.update(`=== CHAT FUNCTION STARTED ===
=== ASYNC PROCESSING STARTED ===
About to call generateSqlFromUserQuery
generateSqlFromUserQuery: Starting, message: ${userMessage}
generateSqlFromUserQuery: API key exists, creating textStream
generateSqlFromUserQuery: textStream created, processing...
=== RETURNING FROM CHAT FUNCTION ===
generateSqlFromUserQuery: Raw SQL query: ${sqlQuery}
generateSqlFromUserQuery: Cleaned SQL query: ${sqlQuery}
generateSqlFromUserQuery completed: ${sqlQuery}`);
				} catch (sqlGenError: any) {
					console.error('SQL Generation Error:', sqlGenError);
					responseStarted = true;
					if (fallbackTimer) clearTimeout(fallbackTimer);

					stream.update(`SQL Generation failed: ${sqlGenError.message}`);
					stream.done();
					return;
				}

				if (sqlQuery === 'NOT_SQL_QUERY') {
					console.log('Processing conversational query...');
					responseStarted = true;
					if (fallbackTimer) clearTimeout(fallbackTimer);

					try {
						console.log('About to create conversational textStream');

						// Simple conversational response
						const { textStream } = streamText({
							model: gemini('gemini-1.5-flash'),
							messages: [
								{
									role: 'user',
									content: userMessage,
								},
							],
							maxTokens: 150,
							temperature: 0.7,
						});

						console.log('Conversational textStream created successfully');

						let hasContent = false;
						let responseText = '';

						console.log('Starting to process conversational textStream');
						for await (const text of textStream) {
							console.log(
								'Received conversational text chunk:',
								text?.substring(0, 50)
							);
							if (text && text.trim()) {
								hasContent = true;
								responseText += text;
								stream.update(responseText);
							}
						}
						console.log(
							'Finished processing conversational textStream, hasContent:',
							hasContent
						);

						if (!hasContent) {
							console.log(
								'No content received from conversation, using fallback'
							);
							stream.update(
								'Hello! How can I help you with your e-commerce dashboard today?'
							);
						}
					} catch (conversationError: any) {
						console.error('Conversation Error Details:', conversationError);
						stream.update(
							"Hello! I'm here to help with your e-commerce dashboard. What would you like to know?"
						);
					}

					stream.done();
					return;
				}

				// SQL query processing
				console.log('Processing SQL query...');
				console.log('query :', sqlQuery);

				// Update stream before SQL execution
				stream.update(`=== CHAT FUNCTION STARTED ===
=== ASYNC PROCESSING STARTED ===
About to call generateSqlFromUserQuery
generateSqlFromUserQuery: Starting, message: ${userMessage}
generateSqlFromUserQuery: API key exists, creating textStream
generateSqlFromUserQuery: textStream created, processing...
=== RETURNING FROM CHAT FUNCTION ===
generateSqlFromUserQuery: Raw SQL query: ${sqlQuery}
generateSqlFromUserQuery: Cleaned SQL query: ${sqlQuery}
generateSqlFromUserQuery completed: ${sqlQuery}
Processing SQL query...
query : ${sqlQuery}`);

				try {
					const sqlResults = await sqlApi.execute(sqlQuery);
					responseStarted = true;
					if (fallbackTimer) clearTimeout(fallbackTimer);

					console.log('SQL executed successfully');

					// Update stream with SQL execution success
					stream.update(`=== CHAT FUNCTION STARTED ===
=== ASYNC PROCESSING STARTED ===
About to call generateSqlFromUserQuery
generateSqlFromUserQuery: Starting, message: ${userMessage}
generateSqlFromUserQuery: API key exists, creating textStream
generateSqlFromUserQuery: textStream created, processing...
=== RETURNING FROM CHAT FUNCTION ===
generateSqlFromUserQuery: Raw SQL query: ${sqlQuery}
generateSqlFromUserQuery: Cleaned SQL query: ${sqlQuery}
generateSqlFromUserQuery completed: ${sqlQuery}
Processing SQL query...
query : ${sqlQuery}
SQL executed successfully

**Results:**
${JSON.stringify(sqlResults.data, null, 2)}`);

					// Now format the results
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
					stream.update(`=== CHAT FUNCTION STARTED ===
=== ASYNC PROCESSING STARTED ===
About to call generateSqlFromUserQuery
generateSqlFromUserQuery: Starting, message: ${userMessage}
generateSqlFromUserQuery: API key exists, creating textStream
generateSqlFromUserQuery: textStream created, processing...
=== RETURNING FROM CHAT FUNCTION ===
generateSqlFromUserQuery: Raw SQL query: ${sqlQuery}
generateSqlFromUserQuery: Cleaned SQL query: ${sqlQuery}
generateSqlFromUserQuery completed: ${sqlQuery}
Processing SQL query...
query : ${sqlQuery}
SQL execution error: ${sqlError.message}`);
				}
			} catch (asyncError: any) {
				console.error('=== ASYNC PROCESSING ERROR ===', asyncError);

				if (!responseStarted) {
					stream.update(
						`Processing error: ${asyncError.message || 'Unknown error'}`
					);
				}
			} finally {
				console.log('=== ASYNC PROCESSING CLEANUP ===');
				if (fallbackTimer) clearTimeout(fallbackTimer);
				if (!responseStarted) {
					console.log('No response started, providing fallback');
					stream.update('Hello! How can I assist you today?');
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
			stream.update(
				`Error: ${outerError?.message || 'Unknown error occurred'}`
			);
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
		let formattedResponse = '\n\n**Formatted Results:**\n\n';

		if (
			!resultsData ||
			(Array.isArray(resultsData) && resultsData.length === 0)
		) {
			formattedResponse += 'No results found for your query.';
		} else if (Array.isArray(resultsData)) {
			formattedResponse += `Found ${resultsData.length} results:\n\n`;
			resultsData.slice(0, 10).forEach((item, index) => {
				if (typeof item === 'object') {
					const values = Object.values(item).join(' | ');
					formattedResponse += `${index + 1}. ${values}\n`;
				} else {
					formattedResponse += `${index + 1}. ${item}\n`;
				}
			});

			if (resultsData.length > 10) {
				formattedResponse += `\n... and ${
					resultsData.length - 10
				} more results.`;
			}
		} else {
			formattedResponse += JSON.stringify(resultsData, null, 2);
		}

		// Get the current content and append the formatted results
		stream.update(stream.value + formattedResponse);
	} catch (error: any) {
		stream.update(
			stream.value +
				`\n\nFormatting error: ${error.message}\nRaw data: ${JSON.stringify(
					resultsData
				).substring(0, 200)}...`
		);
	}
}
