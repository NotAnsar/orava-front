import { OrderWithItems, Product, User } from '@/types/db';

// Dummy product data
const dummyProducts: Product[] = [
	{
		id: '1',
		name: 'Classic T-Shirt',
		price: 29.99,
		description: 'A comfortable cotton t-shirt',
		category_id: '1',
		color_id: '1',
		size_id: '2',
		stock: 50,
		featured: true,
		archived: false,
		createdAt: '2023-01-15T00:00:00Z',
	},
	{
		id: '2',
		name: 'Slim Fit Jeans',
		price: 59.99,
		description: 'Modern slim fit jeans',
		category_id: '2',
		color_id: '3',
		size_id: '2',
		stock: 35,
		featured: true,
		archived: false,
		createdAt: '2023-01-20T00:00:00Z',
	},
];

// Dummy user data
const dummyUsers: User[] = [
	{
		id: '1',
		email: 'admin@example.com',
		firstName: 'Admin',
		lastName: 'User',
		role: 'admin',
		createdAt: '2023-01-01T00:00:00Z',
	},
	{
		id: '2',
		email: 'customer@example.com',
		firstName: 'John',
		lastName: 'Doe',
		role: 'user',
		createdAt: '2023-01-05T00:00:00Z',
	},
];

// Dummy orders data
const dummyOrders: OrderWithItems[] = [
	{
		id: '1',
		status: 'delivered',
		total: 89.98,
		createdAt: '2023-02-15T10:00:00Z',
		user_id: '2',
		user: dummyUsers[1],
		order_Items: [
			{
				id: '1',
				order_id: '1',
				product_id: '1',
				quantity: 2,
				unit_price: 29.99,
				createdAt: '2023-02-15T10:00:00Z',
				product: dummyProducts[0],
			},
			{
				id: '2',
				order_id: '1',
				product_id: '2',
				quantity: 1,
				unit_price: 59.99,
				createdAt: '2023-02-15T10:00:00Z',
				product: dummyProducts[1],
			},
		],
	},
	{
		id: '2',
		status: 'shipped',
		total: 59.99,
		createdAt: '2023-03-01T14:30:00Z',
		user_id: '2',
		user: dummyUsers[1],
		order_Items: [
			{
				id: '3',
				order_id: '2',
				product_id: '2',
				quantity: 1,
				unit_price: 59.99,
				createdAt: '2023-03-01T14:30:00Z',
				product: dummyProducts[1],
			},
		],
	},
	{
		id: '3',
		status: 'pending',
		total: 29.99,
		createdAt: '2023-03-10T09:15:00Z',
		user_id: '2',
		user: dummyUsers[1],
		order_Items: [
			{
				id: '4',
				order_id: '3',
				product_id: '1',
				quantity: 1,
				unit_price: 29.99,
				createdAt: '2023-03-10T09:15:00Z',
				product: dummyProducts[0],
			},
		],
	},
];

export async function fetchOrders() {
	try {
		// Return all dummy orders
		return dummyOrders;
	} catch (error) {
		console.error('Error:', error);
		throw new Error('Failed to fetch Orders.');
	}
}

export async function fetchOrderById(id: string) {
	try {
		// Find order by ID
		const order = dummyOrders.find((order) => order.id === id);
		if (!order) {
			throw new Error(`Order with ID ${id} not found`);
		}
		return order;
	} catch (error) {
		console.error('Error:', error);
		throw new Error(`Failed to fetch Order with ID ${id}.`);
	}
}
