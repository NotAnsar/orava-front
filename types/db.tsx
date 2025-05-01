export type Color = {
	createdAt: string;
	id: string;
	name: string;
	value: string | null;
};

export type Category = {
	createdAt: string;
	id: string;
	name: string;
};

export type Size = {
	createdAt: string;
	fullname: string | null;
	id: string;
	name: string;
};

export type Product = {
	archived: boolean;
	category_id: string;
	color_id: string | null;
	createdAt: string;
	description: string | null;
	featured: boolean;
	id: string;
	name: string;
	price: number;
	size_id: string;
	stock: number;
};

export type ProductALL = Product & {
	colors: Color;
	sizes: Size;
	category: Category;
};

export type ProductWithImages = Product & { images: string[] };

export type User = {
	createdAt: string;
	email: string;
	firstName: string | null;
	id: string;
	lastName: string | null;
	role: string | null;
};

export type OrderItems = {
	createdAt: string;
	id: string;
	order_id: string;
	product_id: string;
	quantity: number;
	unit_price: number;
};

export type Order = {
	createdAt: string;
	id: string;
	status: StatusEnum;
	total: number;
	user_id: string;
};

export type OrderWithItems = Order & {
	order_Items: (OrderItems & { product: Product })[];
	user: User;
};

type StatusEnum = 'pending' | 'shipped' | 'delivered' | 'canceled';

export const statusEnumValues: StatusEnum[] = [
	'pending',
	'shipped',
	'delivered',
	'canceled',
];
