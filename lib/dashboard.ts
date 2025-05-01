import { Archive, CreditCard, DollarSign, Users } from 'lucide-react';
import { ProductALL } from '@/types/db';

// Dummy dashboard metrics
export async function fetchTotalClients() {
	try {
		// Pretend we have 24 clients
		const clientCount = 24;

		return {
			id: 'dashboard-01-chunk-1',
			title: 'Total Clients',
			icon: Users,
			value: `+${clientCount}`,
			description: 'Number Of all your clients',
		};
	} catch (error) {
		console.error('Error:', error);
		throw new Error(`Failed to fetch Total Clients.`);
	}
}

export async function fetchTotalProducts() {
	try {
		// Use the length of our dummy products array
		// Since we don't have access to it directly here, we'll use a hard-coded number
		const productCount = 15;

		return {
			id: 'dashboard-01-chunk-3',
			title: 'Total Products',
			icon: Archive,
			value: `+${productCount}`,
			description: 'Number of all your products',
		};
	} catch (error) {
		console.error('Error:', error);
		throw new Error(`Failed to fetch Total Products.`);
	}
}

export async function fetchLowestInStock() {
	try {
		// Create some dummy products with low stock
		const lowStockProducts: ProductALL[] = [
			{
				id: '4',
				name: 'Cotton Hoodie',
				price: 49.99,
				description: 'Warm cotton hoodie for winter',
				category_id: '1',
				color_id: '3',
				size_id: '2',
				stock: 3,
				featured: false,
				archived: false,
				createdAt: '2023-02-15T00:00:00Z',
				category: {
					id: '1',
					name: 'Clothing',
					createdAt: '2023-01-01T00:00:00Z',
				},
				colors: {
					id: '3',
					name: 'Black',
					value: '#000000',
					createdAt: '2023-01-01T00:00:00Z',
				},
				sizes: {
					id: '2',
					name: 'M',
					fullname: 'Medium',
					createdAt: '2023-01-01T00:00:00Z',
				},
			},
			{
				id: '5',
				name: 'Winter Beanie',
				price: 19.99,
				description: 'Warm beanie hat for winter',
				category_id: '3',
				color_id: '1',
				size_id: '1',
				stock: 5,
				featured: true,
				archived: false,
				createdAt: '2023-02-20T00:00:00Z',
				category: {
					id: '3',
					name: 'Accessories',
					createdAt: '2023-01-01T00:00:00Z',
				},
				colors: {
					id: '1',
					name: 'Red',
					value: '#FF0000',
					createdAt: '2023-01-01T00:00:00Z',
				},
				sizes: {
					id: '1',
					name: 'S',
					fullname: 'Small',
					createdAt: '2023-01-01T00:00:00Z',
				},
			},
			{
				id: '6',
				name: 'Leather Wallet',
				price: 39.99,
				description: 'Genuine leather wallet',
				category_id: '3',
				color_id: '3',
				size_id: '1',
				stock: 7,
				featured: false,
				archived: false,
				createdAt: '2023-03-01T00:00:00Z',
				category: {
					id: '3',
					name: 'Accessories',
					createdAt: '2023-01-01T00:00:00Z',
				},
				colors: {
					id: '3',
					name: 'Black',
					value: '#000000',
					createdAt: '2023-01-01T00:00:00Z',
				},
				sizes: {
					id: '1',
					name: 'S',
					fullname: 'Small',
					createdAt: '2023-01-01T00:00:00Z',
				},
			},
		];

		return lowStockProducts;
	} catch (error) {
		console.error('Error:', error);
		throw new Error(`Failed to fetch Products Low In Stock.`);
	}
}

export async function fetchTotalRevenue() {
	// Dummy revenue data
	return {
		id: 'dashboard-01-chunk-0',
		title: 'Total Revenue',
		icon: DollarSign,
		value: '$12,456.70',
		description: '+20.1% from last month',
	};
}

export async function fetchTotalSales() {
	// Dummy sales data
	return {
		id: 'dashboard-01-chunk-2',
		title: 'Total Sales',
		icon: CreditCard,
		value: '+234',
		description: '+19% from last month',
	};
}
