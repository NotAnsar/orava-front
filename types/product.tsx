import { Category } from './category';
import { Color } from './color';
import { Size } from './size';

export type Product = {
	id: string;
	name: string;
	price: number;
	stock: number;
	createdAt: string;
	description: string;
	archived: boolean;
	featured: boolean;
	color: Color;
	size: Size;
	category: Category;
};

// API endpoints
export const PRODUCT_API = '/api/products';
