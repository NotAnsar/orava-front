'use server';

import { Product } from '@/types/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const formSchema = z.object({
	name: z
		.string()
		.min(3, { message: 'Product Name must be at least 3 characters long.' }),
	description: z.string(),
	price: z.coerce
		.number()
		.positive({ message: 'Price must be a positive number' }),
	stock: z.coerce
		.number()
		.int()
		.min(0, { message: 'Stock must be a non-negative integer' }),
	category_id: z.string({
		message: 'Please provide a valid category identifier.',
	}),
	color_id: z.string({ message: 'Please provide a valid color identifier.' }),
	size_id: z.string({ message: 'Please provide a valid size identifier.' }),
	archived: z.boolean(),
	featured: z.boolean(),
	// Image validation removed for simplicity in dummy implementation
});

export type ProductState =
	| {
			errors?: {
				name?: string[];
				description?: string[];
				price?: string[] | undefined;
				stock?: string[] | undefined;
				category_id?: string[] | undefined;
				archived?: string[] | undefined;
				featured?: string[] | undefined;
				color_id?: string[] | undefined;
				size_id?: string[] | undefined;
			};
			message?: string | null;
	  }
	| undefined;

// In-memory storage for dummy products
let dummyProducts = [
	{
		id: '1',
		name: 'Classic T-Shirt',
		description: 'A comfortable cotton t-shirt',
		price: 29.99,
		stock: 50,
		category_id: '1',
		color_id: '1',
		size_id: '2',
		featured: true,
		archived: false,
		createdAt: '2023-01-15T00:00:00Z',
	},
	{
		id: '2',
		name: 'Slim Fit Jeans',
		description: 'Modern slim fit jeans',
		price: 59.99,
		stock: 35,
		category_id: '2',
		color_id: '3',
		size_id: '2',
		featured: true,
		archived: false,
		createdAt: '2023-01-20T00:00:00Z',
	},
] as Product[];
let productId = 3; // Starting ID for new products

export async function createProduct(
	prevState: ProductState,
	formData: FormData
) {
	const validatedFields = formSchema.safeParse({
		name: formData.get('name'),
		description: formData.get('description'),
		stock: formData.get('stock'),
		price: formData.get('price'),
		color_id: formData.get('color'),
		category_id: formData.get('category'),
		size_id: formData.get('size'),
		featured: formData.get('featured') === 'on',
		archived: formData.get('status') === 'archived',
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Invalid data. Unable to create product.',
		};
	}

	if (validatedFields.data.archived && validatedFields.data.featured) {
		return { message: 'Archived products cannot be featured.' };
	}

	try {
		// Create a new product in our dummy data
		const newProduct = {
			id: String(productId++),
			...validatedFields.data,
			description:
				validatedFields.data.description === ''
					? null
					: validatedFields.data.description,
			createdAt: new Date().toISOString(),
		};

		dummyProducts.push(newProduct);
		console.log('Product created:', newProduct);

		// Log any image uploads that would happen
		const imageFiles = formData.getAll('product_images');
		if (imageFiles && imageFiles.length > 0) {
			console.log(
				`Would upload ${imageFiles.length} images for product ${newProduct.id}`
			);
		}
	} catch (error) {
		console.error(error);
		return { message: 'Error: Failed to Create Product.' };
	}

	revalidatePath('/products', 'layout');
	redirect('/products');
}

export async function updateProduct(
	id: string,
	prevState: ProductState,
	formData: FormData
) {
	const validatedFields = formSchema.safeParse({
		name: formData.get('name'),
		description: formData.get('description'),
		stock: formData.get('stock'),
		price: formData.get('price'),
		color_id: formData.get('color'),
		category_id: formData.get('category'),
		size_id: formData.get('size'),
		featured: formData.get('featured') === 'on',
		archived: formData.get('status') === 'archived',
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Invalid data. Unable to update product.',
		};
	}

	if (validatedFields.data.archived && validatedFields.data.featured) {
		return { message: 'Archived products cannot be featured.' };
	}

	try {
		// Find and update product in dummy data
		const productIndex = dummyProducts.findIndex(
			(product) => product.id === id
		);

		if (productIndex === -1) {
			throw new Error(`Product with ID ${id} not found`);
		}

		dummyProducts[productIndex] = {
			...dummyProducts[productIndex],
			...validatedFields.data,
			description:
				validatedFields.data.description === ''
					? null
					: validatedFields.data.description,
		};

		console.log('Product updated:', dummyProducts[productIndex]);

		// Log any image uploads that would happen
		const imageFiles = formData.getAll('product_images');
		if (imageFiles && imageFiles.length > 0) {
			console.log(`Would upload ${imageFiles.length} images for product ${id}`);
		}
	} catch (error) {
		console.error(error);
		return {
			message: `Error: Failed to Update Product. ${(error as Error).message}`,
		};
	}

	revalidatePath('/products', 'layout');
	redirect('/products');
}

export type DeleteProductState = {
	message?: string | null;
	type?: string | null;
};

export async function deleteProduct(id: string) {
	try {
		// Filter out the product to be deleted
		const initialLength = dummyProducts.length;
		dummyProducts = dummyProducts.filter((product) => product.id !== id);

		if (dummyProducts.length === initialLength) {
			throw new Error(`Product with ID ${id} not found`);
		}

		console.log(`Product ${id} deleted`);
		console.log(`Would delete all images for product ${id}`);
	} catch (error) {
		console.error(error);
		return {
			message: `Failed to delete product: ${(error as Error).message}`,
			type: 'error',
		};
	}

	revalidatePath('/products', 'layout');
	return {
		message: 'Product and Associated Images Were Deleted Successfully.',
	};
}
