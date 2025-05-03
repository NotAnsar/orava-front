import {
	Category,
	Color,
	ProductALL,
	ProductWithImages,
	Size,
} from '@/types/db';

// Dummy Categories
const dummyCategories: Category[] = [
	{
		id: '1',
		name: 'Shirts',
		createdAt: '2023-01-01T00:00:00Z',
	},
	{
		id: '2',
		name: 'Pants',
		createdAt: '2023-01-01T00:00:00Z',
	},
	{
		id: '3',
		name: 'Shoes',
		createdAt: '2023-01-01T00:00:00Z',
	},
];

// Dummy Colors
const dummyColors: Color[] = [
	{
		id: '1',
		name: 'Red',
		value: '#FF0000',
		createdAt: '2023-01-01T00:00:00Z',
	},
	{
		id: '2',
		name: 'Blue',
		value: '#0000FF',
		createdAt: '2023-01-01T00:00:00Z',
	},
	{
		id: '3',
		name: 'Black',
		value: '#000000',
		createdAt: '2023-01-01T00:00:00Z',
	},
];

// Dummy Sizes
const dummySizes: Size[] = [
	{
		id: '1',
		name: 'S',
		fullname: 'Small',
		createdAt: '2023-01-01T00:00:00Z',
	},
	{
		id: '2',
		name: 'M',
		fullname: 'Medium',
		createdAt: '2023-01-01T00:00:00Z',
	},
	{
		id: '3',
		name: 'L',
		fullname: 'Large',
		createdAt: '2023-01-01T00:00:00Z',
	},
];

// Dummy Products
const dummyProducts: ProductALL[] = [
	{
		id: '1',
		name: 'Classic T-Shirt',
		price: 29.99,
		description: 'A comfortable cotton t-shirt for everyday wear',
		category_id: '1',
		color_id: '1',
		size_id: '2',
		stock: 50,
		featured: true,
		archived: false,
		createdAt: '2023-01-15T00:00:00Z',
		category: dummyCategories[0],
		colors: dummyColors[0],
		sizes: dummySizes[1],
	},
	{
		id: '2',
		name: 'Slim Fit Jeans',
		price: 59.99,
		description: 'Modern slim fit jeans with stretch fabric',
		category_id: '2',
		color_id: '3',
		size_id: '2',
		stock: 35,
		featured: true,
		archived: false,
		createdAt: '2023-01-20T00:00:00Z',
		category: dummyCategories[1],
		colors: dummyColors[2],
		sizes: dummySizes[1],
	},
	{
		id: '3',
		name: 'Running Sneakers',
		price: 89.99,
		description: 'Lightweight running shoes with cushioned soles',
		category_id: '3',
		color_id: '2',
		size_id: '3',
		stock: 20,
		featured: false,
		archived: false,
		createdAt: '2023-02-01T00:00:00Z',
		category: dummyCategories[2],
		colors: dummyColors[1],
		sizes: dummySizes[2],
	},
];

// Dummy image URLs (using placeholder services)
const dummyImageUrls = {
	'1': [
		'https://placehold.co/600x400?text=T-Shirt+Front',
		'https://placehold.co/600x400?text=T-Shirt+Back',
	],
	'2': [
		'https://placehold.co/600x400?text=Jeans+Front',
		'https://placehold.co/600x400?text=Jeans+Side',
	],
	'3': [
		'https://placehold.co/600x400?text=Sneakers+Side',
		'https://placehold.co/600x400?text=Sneakers+Top',
		'https://placehold.co/600x400?text=Sneakers+Bottom',
	],
};

export async function fetchProducts() {
	try {
		// Return all dummy products
		return dummyProducts;
	} catch (error) {
		console.error('Error:', error);
		throw new Error('Failed to fetch Products.');
	}
}

export async function fetchProductById(id: string) {
	try {
		// Find product by ID
		const product = dummyProducts.find((product) => product.id === id);
		if (!product) {
			throw new Error(`Product with ID ${id} not found`);
		}
		return product;
	} catch (error) {
		console.error('Error:', error);
		throw new Error(`Failed to fetch Product with the id ${id}.`);
	}
}

export async function fetchProductImagesById(id: string) {
	try {
		// Get dummy images for a product
		const images = dummyImageUrls[id as keyof typeof dummyImageUrls] || [];

		// Return in a format similar to Supabase storage list response
		return images.map((url, index) => ({
			name: `image_${index + 1}.jpg`,
			id: `${id}_${index}`,
			metadata: {},
			createdAt: '2023-01-01T00:00:00Z',
			last_modified: '2023-01-01T00:00:00Z',
			size: 10000,
		}));
	} catch (error) {
		console.error('Error:', error);
		throw new Error(`Failed to fetch Images of the product id ${id}.`);
	}
}

export async function fetchProductWithImages(id: string) {
	try {
		// Find product by ID
		const product = dummyProducts.find((product) => product.id === id);
		if (!product) {
			throw new Error(`Product with ID ${id} not found`);
		}

		// Get image URLs for the product
		const images = dummyImageUrls[id as keyof typeof dummyImageUrls] || [];

		// Return product with images
		return { ...product, images } as ProductWithImages;
	} catch (error) {
		console.error('Error:', error);
		throw new Error(`Failed to fetch Product and Images with the id ${id}.`);
	}
}

export async function fetchCategories() {
	try {
		return dummyCategories;
	} catch (error) {
		console.error('Error:', error);
		throw new Error('Failed to fetch Categories.');
	}
}

export async function fetchSizes() {
	try {
		return dummySizes;
	} catch (error) {
		console.error('Error:', error);
		throw new Error('Failed to fetch Sizes.');
	}
}

export async function fetchColors() {
	try {
		return dummyColors;
	} catch (error) {
		console.error('Error:', error);
		throw new Error('Failed to fetch Colors.');
	}
}
