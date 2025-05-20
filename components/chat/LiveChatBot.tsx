'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, MessageSquare, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import ChatSuggestions from './ChatSuggestions';

// Mock data to replace fetch functions
const mockOrders = [
	{
		id: '1',
		userName: 'John Doe',
		status: 'Completed',
		total: 129.99,
		createdAt: '2025-05-18T10:30:00Z',
	},
	{
		id: '2',
		userName: 'Jane Smith',
		status: 'Processing',
		total: 79.5,
		createdAt: '2025-05-17T15:20:00Z',
	},
	{
		id: '3',
		userName: 'Michael Johnson',
		status: 'Shipped',
		total: 249.99,
		createdAt: '2025-05-16T09:45:00Z',
	},
	{
		id: '4',
		userName: 'Emily Brown',
		status: 'Processing',
		total: 34.25,
		createdAt: '2025-05-15T14:15:00Z',
	},
	{
		id: '5',
		userName: 'David Wilson',
		status: 'Completed',
		total: 159.99,
		createdAt: '2025-05-14T11:10:00Z',
	},
];

const mockInventoryAlerts = [
	{
		productId: '101',
		productName: 'Wireless Headphones',
		categoryName: 'Electronics',
		currentStock: 2,
	},
	{
		productId: '102',
		productName: 'Fitness Tracker',
		categoryName: 'Wearables',
		currentStock: 0,
	},
	{
		productId: '103',
		productName: 'Organic Coffee',
		categoryName: 'Food & Beverages',
		currentStock: 3,
	},
];

const mockProducts = Array(48)
	.fill(null)
	.map((_, i) => ({
		id: (i + 1).toString(),
		name: `Product ${i + 1}`,
	}));

type MessageType = {
	id: string;
	content: string | React.ReactNode;
	sender: 'user' | 'bot';
	timestamp: Date;
};

export default function LiveChatBot() {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<MessageType[]>([
		{
			id: '1',
			content: 'Hello! How can I help you with your dashboard today?',
			sender: 'bot',
			timestamp: new Date(),
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
			id: Date.now().toString(),
			content: inputMessage,
			sender: 'user' as const,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputMessage('');
		setIsLoading(true);

		// Simulate processing delay
		setTimeout(async () => {
			const response = await processQuery(inputMessage);

			setMessages((prev) => [
				...prev,
				{
					id: (Date.now() + 1).toString(),
					content: response,
					sender: 'bot' as const,
					timestamp: new Date(),
				},
			]);

			setIsLoading(false);
		}, 1000);
	};

	const processQuery = async (
		query: string
	): Promise<string | React.ReactNode> => {
		const lowercaseQuery = query.toLowerCase();

		try {
			// Check for last orders query
			if (lowercaseQuery.includes('last') && lowercaseQuery.includes('order')) {
				const limit = extractNumberFromQuery(lowercaseQuery) || 5;
				const orders = mockOrders;
				const lastOrders = orders.slice(0, limit);
				return formatOrdersResponse(lastOrders, limit);
			}

			// Check for out of stock query
			if (
				(lowercaseQuery.includes('out of stock') ||
					lowercaseQuery.includes('low stock')) &&
				lowercaseQuery.includes('product')
			) {
				const alerts = mockInventoryAlerts;
				return formatInventoryResponse(alerts);
			}

			// Check for total products query
			if (
				lowercaseQuery.includes('total') &&
				lowercaseQuery.includes('product')
			) {
				const products = mockProducts;
				return `You have ${products.length} total products in your inventory.`;
			}

			// Default response for unrecognized queries
			return "I'm not sure how to answer that. You can ask me about recent orders, out of stock products, or total products.";
		} catch (error) {
			console.error('Error processing query:', error);
			return 'Sorry, I encountered an error while retrieving that information. Please try again later.';
		}
	};

	const extractNumberFromQuery = (query: string): number | null => {
		const matches = query.match(/\d+/);
		return matches ? parseInt(matches[0], 10) : null;
	};

	const formatOrdersResponse = (orders: any[], limit: number) => (
		<div className='flex flex-col gap-2'>
			<p className='text-sm font-medium'>Here are the last {limit} orders:</p>
			{orders.length > 0 ? (
				orders.map((order) => (
					<div
						key={order.id}
						className='text-xs p-2 border rounded-md bg-secondary/40'
					>
						<div className='flex justify-between items-center'>
							<span className='font-medium'>{order.userName}</span>
							<Badge variant='outline'>{order.status}</Badge>
						</div>
						<div className='flex justify-between mt-1'>
							<span>{new Date(order.createdAt).toLocaleDateString()}</span>
							<span className='font-medium'>${order.total.toFixed(2)}</span>
						</div>
					</div>
				))
			) : (
				<p className='text-sm text-muted-foreground'>No orders found.</p>
			)}
		</div>
	);

	const formatInventoryResponse = (alerts: any[] | null) => {
		if (!alerts || alerts.length === 0) {
			return "Good news! You don't have any products that are out of stock or running low.";
		}

		return (
			<div className='flex flex-col gap-2'>
				<p className='text-sm font-medium'>Products with low inventory:</p>
				{alerts.map((product) => (
					<div
						key={product.productId}
						className='text-xs p-2 border rounded-md bg-secondary/40'
					>
						<div className='flex justify-between'>
							<span className='font-medium'>{product.productName}</span>
							<Badge
								variant={product.currentStock === 0 ? 'destructive' : 'outline'}
							>
								{product.currentStock === 0
									? 'Out of stock'
									: `${product.currentStock} left`}
							</Badge>
						</div>
						<div className='text-muted-foreground mt-1'>
							{product.categoryName}
						</div>
					</div>
				))}
			</div>
		);
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
							{messages.map((message) => (
								<div
									key={message.id}
									className={cn('flex gap-2', {
										'justify-start': message.sender === 'bot',
										'justify-end': message.sender === 'user',
									})}
								>
									{message.sender === 'bot' && (
										<Avatar className='h-8 w-8'>
											<AvatarFallback className='bg-primary text-primary-foreground'>
												<Bot size={14} />
											</AvatarFallback>
										</Avatar>
									)}
									<div
										className={cn('rounded-lg p-3 max-w-[80%]', {
											'bg-secondary': message.sender === 'bot',
											'bg-primary text-primary-foreground':
												message.sender === 'user',
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
