// API endpoint
export const ORDER_API = '/api/orders';

export type Order = {
	id: string;
	userId: string;
	userName: string;
	userEmail: string;
	total: number;
	createdAt: string;
	status: OrderStatus;
	items: OrderItem[];
};

export type OrderItem = {
	id: string;
	productId: string;
	productName: string;
	quantity: number;
	unitPrice: number;
	subtotal: number;
};

export type OrderStatus =
	| 'PENDING'
	| 'PROCESSING'
	| 'SHIPPED'
	| 'DELIVERED'
	| 'CANCELED';

export const statusEnumValues: {
	value: OrderStatus;
	label: string;
}[] = [
	{ value: 'PENDING', label: 'Pending' },
	{ value: 'PROCESSING', label: 'Processing' },
	{ value: 'SHIPPED', label: 'Shipped' },
	{ value: 'DELIVERED', label: 'Delivered' },
	{ value: 'CANCELED', label: 'Canceled' },
];
