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
										{message.content}
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
