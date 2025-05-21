// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { Bot, MessageSquare, Send, X } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent } from '@/components/ui/card';
// import { cn } from '@/lib/utils';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import ChatSuggestions from './ChatSuggestions';
// import { chat } from '@/api/chat';
// import { readStreamableValue } from 'ai/rsc';

// export type Message = {
// 	role: 'user' | 'assistant';
// 	content: string;
// };

// export default function LiveChatBot() {
// 	const [isOpen, setIsOpen] = useState(false);
// 	const [messages, setMessages] = useState<Message[]>([
// 		{
// 			content: 'Hello! How can I help you with your dashboard today?',
// 			role: 'assistant',
// 		},
// 	]);
// 	const [inputMessage, setInputMessage] = useState('');
// 	const [isLoading, setIsLoading] = useState(false);
// 	const messagesEndRef = useRef<HTMLDivElement>(null);
// 	const inputRef = useRef<HTMLInputElement>(null);

// 	// Scroll to bottom of messages when new messages are added
// 	useEffect(() => {
// 		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// 	}, [messages]);

// 	// Focus input when chat is opened
// 	useEffect(() => {
// 		if (isOpen) {
// 			inputRef.current?.focus();
// 		}
// 	}, [isOpen]);

// 	const handleSendMessage = async (e?: React.FormEvent) => {
// 		e?.preventDefault();

// 		if (!inputMessage.trim()) return;

// 		const userMessage = {
// 			content: inputMessage,
// 			role: 'user' as const,
// 		} as Message;

// 		setMessages((prev) => [...prev, userMessage]);
// 		setInputMessage('');
// 		setIsLoading(true);

// 		try {
// 			const { newMessage } = await chat([...messages, userMessage]);

// 			let textContent = '';

// 			let assistantMessage: Message = {
// 				role: 'assistant',
// 				content: '',
// 			};

// 			for await (const delta of readStreamableValue(newMessage)) {
// 				textContent += delta;

// 				assistantMessage = {
// 					role: 'assistant',
// 					content: textContent,
// 				};
// 			}

// 			setMessages((prev) => [...prev, assistantMessage]);
// 		} catch (error) {
// 			console.error('Error: ', error);
// 			setMessages((prev) => [
// 				...prev,
// 				{
// 					role: 'assistant',
// 					content: 'Sorry, there was an error. Please try again',
// 				},
// 			]);
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	};

// 	const handleSelectSuggestion = (suggestion: string) => {
// 		setInputMessage(suggestion);
// 	};

// 	return (
// 		<>
// 			<Button
// 				onClick={() => setIsOpen(!isOpen)}
// 				className='fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 shadow-lg '
// 			>
// 				{isOpen ? <X size={20} /> : <MessageSquare size={20} />}
// 			</Button>

// 			{isOpen && (
// 				<Card className='fixed bottom-20 right-4 w-80 md:w-96 h-96 shadow-lg border flex flex-col z-50'>
// 					<div className='bg-primary text-primary-foreground p-3 flex items-center gap-2 justify-between rounded-t-md'>
// 						<div className='flex items-center gap-2'>
// 							<Bot size={18} />
// 							<span className='font-medium'>Dashboard Assistant</span>
// 						</div>
// 						<X
// 							size={18}
// 							className='cursor-pointer'
// 							onClick={() => setIsOpen(false)}
// 						/>
// 					</div>

// 					<ScrollArea className='flex-grow p-3'>
// 						<div className='flex flex-col gap-3'>
// 							{messages.map((message, id) => (
// 								<div
// 									key={id}
// 									className={cn('flex gap-2', {
// 										'justify-start': message.role === 'assistant',
// 										'justify-end': message.role === 'user',
// 									})}
// 								>
// 									{message.role === 'assistant' && (
// 										<Avatar className='h-8 w-8'>
// 											<AvatarFallback className='bg-primary text-primary-foreground'>
// 												<Bot size={14} />
// 											</AvatarFallback>
// 										</Avatar>
// 									)}
// 									<div
// 										className={cn('rounded-lg p-3 max-w-[80%]', {
// 											'bg-secondary': message.role === 'assistant',
// 											'bg-primary text-primary-foreground':
// 												message.role === 'user',
// 										})}
// 									>
// 										{message.content}
// 									</div>
// 								</div>
// 							))}

// 							{messages.length <= 1 && (
// 								<div className='pb-3'>
// 									<p className='text-sm text-muted-foreground mb-2'>
// 										Try asking:
// 									</p>
// 									<ChatSuggestions
// 										onSelectSuggestion={handleSelectSuggestion}
// 									/>
// 								</div>
// 							)}

// 							{isLoading && (
// 								<div className='flex gap-2 justify-start'>
// 									<Avatar className='h-8 w-8'>
// 										<AvatarFallback className='bg-primary text-primary-foreground'>
// 											<Bot size={14} />
// 										</AvatarFallback>
// 									</Avatar>
// 									<div className='bg-secondary rounded-lg p-3 max-w-[80%]'>
// 										<div className='flex gap-1'>
// 											<div
// 												className='w-2 h-2 rounded-full bg-foreground/40 animate-bounce'
// 												style={{ animationDelay: '0ms' }}
// 											></div>
// 											<div
// 												className='w-2 h-2 rounded-full bg-foreground/40 animate-bounce'
// 												style={{ animationDelay: '150ms' }}
// 											></div>
// 											<div
// 												className='w-2 h-2 rounded-full bg-foreground/40 animate-bounce'
// 												style={{ animationDelay: '300ms' }}
// 											></div>
// 										</div>
// 									</div>
// 								</div>
// 							)}
// 							<div ref={messagesEndRef} />
// 						</div>
// 					</ScrollArea>

// 					<CardContent className='p-3 border-t'>
// 						<form onSubmit={handleSendMessage} className='flex gap-2'>
// 							<Input
// 								ref={inputRef}
// 								placeholder='Type your question...'
// 								value={inputMessage}
// 								onChange={(e) => setInputMessage(e.target.value)}
// 								disabled={isLoading}
// 								className='flex-1'
// 							/>
// 							<Button
// 								type='submit'
// 								size='icon'
// 								disabled={isLoading || !inputMessage.trim()}
// 							>
// 								<Send size={16} />
// 							</Button>
// 						</form>
// 					</CardContent>
// 				</Card>
// 			)}
// 		</>
// 	);
// }

// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { Bot, MessageSquare, Send, X } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent } from '@/components/ui/card';
// import { cn } from '@/lib/utils';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import ChatSuggestions from './ChatSuggestions';
// import { chat } from '@/api/chat';
// import { readStreamableValue } from 'ai/rsc';
// import ReactMarkdown from 'react-markdown';

// export type Message = {
// 	role: 'user' | 'assistant';
// 	content: string;
// };

// export default function LiveChatBot() {
// 	const [isOpen, setIsOpen] = useState(false);
// 	const [messages, setMessages] = useState<Message[]>([
// 		{
// 			content: 'Hello! How can I help you with your dashboard today?',
// 			role: 'assistant',
// 		},
// 	]);
// 	const [inputMessage, setInputMessage] = useState('');
// 	const [isLoading, setIsLoading] = useState(false);
// 	const messagesEndRef = useRef<HTMLDivElement>(null);
// 	const inputRef = useRef<HTMLInputElement>(null);

// 	// Scroll to bottom of messages when new messages are added
// 	useEffect(() => {
// 		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// 	}, [messages]);

// 	// Focus input when chat is opened
// 	useEffect(() => {
// 		if (isOpen) {
// 			inputRef.current?.focus();
// 		}
// 	}, [isOpen]);

// 	const handleSendMessage = async (e?: React.FormEvent) => {
// 		e?.preventDefault();

// 		if (!inputMessage.trim()) return;

// 		const userMessage = {
// 			content: inputMessage,
// 			role: 'user' as const,
// 		} as Message;

// 		setMessages((prev) => [...prev, userMessage]);
// 		setInputMessage('');
// 		setIsLoading(true);

// 		try {
// 			const { newMessage } = await chat([...messages, userMessage]);

// 			let textContent = '';

// 			let assistantMessage: Message = {
// 				role: 'assistant',
// 				content: '',
// 			};

// 			for await (const delta of readStreamableValue(newMessage)) {
// 				textContent += delta;

// 				assistantMessage = {
// 					role: 'assistant',
// 					content: textContent,
// 				};
// 			}

// 			setMessages((prev) => [...prev, assistantMessage]);
// 		} catch (error) {
// 			console.error('Error: ', error);
// 			setMessages((prev) => [
// 				...prev,
// 				{
// 					role: 'assistant',
// 					content: 'Sorry, there was an error. Please try again',
// 				},
// 			]);
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	};

// 	const handleSelectSuggestion = (suggestion: string) => {
// 		setInputMessage(suggestion);
// 	};

// 	return (
// 		<>
// 			<Button
// 				onClick={() => setIsOpen(!isOpen)}
// 				className='fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 shadow-lg '
// 			>
// 				{isOpen ? <X size={20} /> : <MessageSquare size={20} />}
// 			</Button>

// 			{isOpen && (
// 				<Card className='fixed bottom-20 right-4 w-80 md:w-96 h-96 shadow-lg border flex flex-col z-50'>
// 					<div className='bg-primary text-primary-foreground p-3 flex items-center gap-2 justify-between rounded-t-md'>
// 						<div className='flex items-center gap-2'>
// 							<Bot size={18} />
// 							<span className='font-medium'>Dashboard Assistant</span>
// 						</div>
// 						<X
// 							size={18}
// 							className='cursor-pointer'
// 							onClick={() => setIsOpen(false)}
// 						/>
// 					</div>

// 					<ScrollArea className='flex-grow p-3'>
// 						<div className='flex flex-col gap-3'>
// 							{messages.map((message, id) => (
// 								<div
// 									key={id}
// 									className={cn('flex gap-2', {
// 										'justify-start': message.role === 'assistant',
// 										'justify-end': message.role === 'user',
// 									})}
// 								>
// 									{message.role === 'assistant' && (
// 										<Avatar className='h-8 w-8'>
// 											<AvatarFallback className='bg-primary text-primary-foreground'>
// 												<Bot size={14} />
// 											</AvatarFallback>
// 										</Avatar>
// 									)}
// 									<div
// 										className={cn('rounded-lg p-3 max-w-[80%]', {
// 											'bg-secondary': message.role === 'assistant',
// 											'bg-primary text-primary-foreground':
// 												message.role === 'user',
// 										})}
// 									>
// 										{message.role === 'assistant' ? (
// 											<ReactMarkdown
// 												className='prose prose-sm dark:prose-invert max-w-none'
// 												components={{
// 													// Style links to match the UI
// 													a: ({ node, ...props }) => (
// 														<a
// 															{...props}
// 															className='text-primary hover:underline'
// 														/>
// 													),
// 													// Compact bullet lists with less margin
// 													ul: ({ node, ...props }) => (
// 														<ul {...props} className='mt-1 mb-1 pl-4' />
// 													),
// 													ol: ({ node, ...props }) => (
// 														<ol {...props} className='mt-1 mb-1 pl-4' />
// 													),
// 													// Smaller paragraphs with less margin
// 													p: ({ node, ...props }) => (
// 														<p {...props} className='mt-1 mb-1' />
// 													),
// 													// Smaller headings that fit in the chat
// 													h1: ({ node, ...props }) => (
// 														<h1
// 															{...props}
// 															className='text-lg font-bold mt-1 mb-1'
// 														/>
// 													),
// 													h2: ({ node, ...props }) => (
// 														<h2
// 															{...props}
// 															className='text-md font-semibold mt-1 mb-1'
// 														/>
// 													),
// 													h3: ({ node, ...props }) => (
// 														<h3
// 															{...props}
// 															className='text-sm font-medium mt-1 mb-1'
// 														/>
// 													),
// 													// Better code blocks
// 													code: ({ node, className, children, ...props }) => {
// 														const match = /language-(\w+)/.exec(
// 															className || ''
// 														);
// 														if (match) {
// 															return (
// 																<div className='bg-muted rounded-md p-1 my-1 text-xs overflow-x-auto'>
// 																	<code className={className} {...props}>
// 																		{children}
// 																	</code>
// 																</div>
// 															);
// 														}
// 														return (
// 															<code
// 																className='bg-muted px-1 rounded text-xs'
// 																{...props}
// 															>
// 																{children}
// 															</code>
// 														);
// 													},
// 												}}
// 											>
// 												{message.content}
// 											</ReactMarkdown>
// 										) : (
// 											message.content
// 										)}
// 									</div>
// 								</div>
// 							))}

// 							{messages.length <= 1 && (
// 								<div className='pb-3'>
// 									<p className='text-sm text-muted-foreground mb-2'>
// 										Try asking:
// 									</p>
// 									<ChatSuggestions
// 										onSelectSuggestion={handleSelectSuggestion}
// 									/>
// 								</div>
// 							)}

// 							{isLoading && (
// 								<div className='flex gap-2 justify-start'>
// 									<Avatar className='h-8 w-8'>
// 										<AvatarFallback className='bg-primary text-primary-foreground'>
// 											<Bot size={14} />
// 										</AvatarFallback>
// 									</Avatar>
// 									<div className='bg-secondary rounded-lg p-3 max-w-[80%]'>
// 										<div className='flex gap-1'>
// 											<div
// 												className='w-2 h-2 rounded-full bg-foreground/40 animate-bounce'
// 												style={{ animationDelay: '0ms' }}
// 											></div>
// 											<div
// 												className='w-2 h-2 rounded-full bg-foreground/40 animate-bounce'
// 												style={{ animationDelay: '150ms' }}
// 											></div>
// 											<div
// 												className='w-2 h-2 rounded-full bg-foreground/40 animate-bounce'
// 												style={{ animationDelay: '300ms' }}
// 											></div>
// 										</div>
// 									</div>
// 								</div>
// 							)}
// 							<div ref={messagesEndRef} />
// 						</div>
// 					</ScrollArea>

// 					<CardContent className='p-3 border-t'>
// 						<form onSubmit={handleSendMessage} className='flex gap-2'>
// 							<Input
// 								ref={inputRef}
// 								placeholder='Type your question...'
// 								value={inputMessage}
// 								onChange={(e) => setInputMessage(e.target.value)}
// 								disabled={isLoading}
// 								className='flex-1'
// 							/>
// 							<Button
// 								type='submit'
// 								size='icon'
// 								disabled={isLoading || !inputMessage.trim()}
// 							>
// 								<Send size={16} />
// 							</Button>
// 						</form>
// 					</CardContent>
// 				</Card>
// 			)}
// 		</>
// 	);
// }

'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, MessageSquare, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatSuggestions from './ChatSuggestions';
import { chat } from '@/api/chat';
import { readStreamableValue } from 'ai/rsc';

// Simple markdown-like text formatter (no external dependencies)
function formatMarkdown(text: string): React.ReactNode {
	if (!text) return null;

	// Process the text in stages
	const formattedText = text
		// Replace markdown bold with spans
		.split(/(\*\*.*?\*\*)/g)
		.map((part, i) => {
			if (part.startsWith('**') && part.endsWith('**')) {
				return <strong key={i}>{part.slice(2, -2)}</strong>;
			}
			return part;
		})
		// Process each line separately
		.map((part) => {
			if (typeof part !== 'string') return part;

			return part.split('\n').map((line, i) => {
				// Headings
				if (line.startsWith('### ')) {
					return (
						<h3 key={i} className='text-sm font-medium my-1'>
							{line.substring(4)}
						</h3>
					);
				}
				if (line.startsWith('## ')) {
					return (
						<h2 key={i} className='text-md font-semibold my-1'>
							{line.substring(3)}
						</h2>
					);
				}

				// Bullet lists
				if (line.startsWith('- ')) {
					return (
						<li key={i} className='ml-4 my-0.5'>
							{line.substring(2)}
						</li>
					);
				}

				// Code blocks - simple single line detection
				if (line.startsWith('```') && line.endsWith('```')) {
					return (
						<pre
							key={i}
							className='bg-muted p-2 rounded text-xs overflow-x-auto my-1'
						>
							{line.slice(3, -3)}
						</pre>
					);
				}

				// Inline code
				if (line.includes('`')) {
					const parts = line.split(/(`.*?`)/g);
					return (
						<p key={i} className='my-1'>
							{parts.map((codePart, j) => {
								if (codePart.startsWith('`') && codePart.endsWith('`')) {
									return (
										<code
											key={j}
											className='bg-muted px-1 py-0.5 rounded text-xs'
										>
											{codePart.slice(1, -1)}
										</code>
									);
								}
								return codePart;
							})}
						</p>
					);
				}

				// Regular paragraph with line breaks
				return (
					<p key={i} className='my-1'>
						{line}
					</p>
				);
			});
		});

	return <div className='prose prose-sm max-w-none'>{formattedText}</div>;
}

export type Message = {
	role: 'user' | 'assistant';
	content: string;
};

export default function LiveChatBot() {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<Message[]>([
		{
			content: 'Hello! How can I help you with your dashboard today?',
			role: 'assistant',
		},
	]);
	const [inputMessage, setInputMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Scroll to bottom of messages when new messages are added
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	// Focus input when chat is opened
	useEffect(() => {
		if (isOpen) {
			inputRef.current?.focus();
		}
	}, [isOpen]);

	const handleSendMessage = async (e?: React.FormEvent) => {
		e?.preventDefault();

		if (!inputMessage.trim()) return;

		const userMessage = {
			content: inputMessage,
			role: 'user' as const,
		} as Message;

		setMessages((prev) => [...prev, userMessage]);
		setInputMessage('');
		setIsLoading(true);

		try {
			const { newMessage } = await chat([...messages, userMessage]);

			let textContent = '';

			let assistantMessage: Message = {
				role: 'assistant',
				content: '',
			};

			for await (const delta of readStreamableValue(newMessage)) {
				textContent += delta;

				assistantMessage = {
					role: 'assistant',
					content: textContent,
				};
			}

			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			console.error('Error: ', error);
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content: 'Sorry, there was an error. Please try again',
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSelectSuggestion = (suggestion: string) => {
		setInputMessage(suggestion);
	};

	return (
		<>
			<Button
				onClick={() => setIsOpen(!isOpen)}
				className='fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 shadow-lg '
			>
				{isOpen ? <X size={20} /> : <MessageSquare size={20} />}
			</Button>

			{isOpen && (
				<Card className='fixed bottom-20 right-4 w-80 md:w-96 h-96 shadow-lg border flex flex-col z-50'>
					<div className='bg-primary text-primary-foreground p-3 flex items-center gap-2 justify-between rounded-t-md'>
						<div className='flex items-center gap-2'>
							<Bot size={18} />
							<span className='font-medium'>Dashboard Assistant</span>
						</div>
						<X
							size={18}
							className='cursor-pointer'
							onClick={() => setIsOpen(false)}
						/>
					</div>

					<ScrollArea className='flex-grow p-3'>
						<div className='flex flex-col gap-3'>
							{messages.map((message, id) => (
								<div
									key={id}
									className={cn('flex gap-2', {
										'justify-start': message.role === 'assistant',
										'justify-end': message.role === 'user',
									})}
								>
									{message.role === 'assistant' && (
										<Avatar className='h-8 w-8'>
											<AvatarFallback className='bg-primary text-primary-foreground'>
												<Bot size={14} />
											</AvatarFallback>
										</Avatar>
									)}
									<div
										className={cn('rounded-lg p-3 max-w-[80%]', {
											'bg-secondary': message.role === 'assistant',
											'bg-primary text-primary-foreground':
												message.role === 'user',
										})}
									>
										{message.role === 'assistant'
											? formatMarkdown(message.content)
											: message.content}
									</div>
								</div>
							))}

							{messages.length <= 1 && (
								<div className='pb-3'>
									<p className='text-sm text-muted-foreground mb-2'>
										Try asking:
									</p>
									<ChatSuggestions
										onSelectSuggestion={handleSelectSuggestion}
									/>
								</div>
							)}

							{isLoading && (
								<div className='flex gap-2 justify-start'>
									<Avatar className='h-8 w-8'>
										<AvatarFallback className='bg-primary text-primary-foreground'>
											<Bot size={14} />
										</AvatarFallback>
									</Avatar>
									<div className='bg-secondary rounded-lg p-3 max-w-[80%]'>
										<div className='flex gap-1'>
											<div
												className='w-2 h-2 rounded-full bg-foreground/40 animate-bounce'
												style={{ animationDelay: '0ms' }}
											></div>
											<div
												className='w-2 h-2 rounded-full bg-foreground/40 animate-bounce'
												style={{ animationDelay: '150ms' }}
											></div>
											<div
												className='w-2 h-2 rounded-full bg-foreground/40 animate-bounce'
												style={{ animationDelay: '300ms' }}
											></div>
										</div>
									</div>
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>
					</ScrollArea>

					<CardContent className='p-3 border-t'>
						<form onSubmit={handleSendMessage} className='flex gap-2'>
							<Input
								ref={inputRef}
								placeholder='Type your question...'
								value={inputMessage}
								onChange={(e) => setInputMessage(e.target.value)}
								disabled={isLoading}
								className='flex-1'
							/>
							<Button
								type='submit'
								size='icon'
								disabled={isLoading || !inputMessage.trim()}
							>
								<Send size={16} />
							</Button>
						</form>
					</CardContent>
				</Card>
			)}
		</>
	);
}
