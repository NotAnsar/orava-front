'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { productSchema } from '@/lib/productSchema';
import axiosInstance from '@/lib/axios';
import { PRODUCT_API } from '@/types/product';
import { Product } from '@/types/product';
import { DeleteState, State } from './utils';

const productActionSchema = productSchema.omit({ images: true });

type ProductData = z.infer<typeof productActionSchema>;
export type ProductState = State<ProductData>;

/**
 * Create a new product
 */
export async function createProduct(
	prevState: ProductState,
	formData: FormData
): Promise<ProductState> {
	const validatedFields = productActionSchema.safeParse({
		name: formData.get('name'),
		description: formData.get('description'),
		price: parseFloat(formData.get('price') as string),
		stock: parseInt(formData.get('stock') as string, 10),
		color_id: formData.get('color_id'),
		size_id: formData.get('size_id'),
		featured: formData.get('featured') === 'true',
		category_id: formData.get('category_id'),
		archived: formData.get('archived') === 'true',
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Invalid product data. Please check the form fields.',
		};
	}

	try {
		const {
			name,
			description,
			price,
			stock,
			featured,
			archived,
			color_id: colorId,
			size_id: sizeId,
			category_id: categoryId,
		} = validatedFields.data;

		// Format data according to the Java backend expectations
		const productData = {
			name,
			description,
			price,
			stock,
			featured,
			archived,
			colorId,
			sizeId,
			categoryId,
		};

		// Create the product via API
		const response = await axiosInstance.post(PRODUCT_API, productData);

		if (!response.data || !response.data.success) {
			throw new Error('Failed to create product');
		}
	} catch (error: any) {
		console.error(error);

		// Handle API error format
		if (error.response?.data) {
			const apiError = error.response.data;

			if (!apiError.success && apiError.errors) {
				// Map API field errors to our error format
				const fieldErrors: Record<string, string[]> = {};

				for (const [field, message] of Object.entries(apiError.errors)) {
					fieldErrors[field] = [message as string];
				}

				return {
					errors: fieldErrors,
					message: apiError.message || 'Failed to create product.',
				};
			}

			return { message: apiError.message || 'Failed to create product.' };
		}

		return { message: error.message || 'Error: Failed to create product.' };
	}

	revalidatePath('/products');
	redirect('/products');
}

/**
 * Update an existing product
 */
export async function updateProduct(
	id: string,
	prevState: ProductState,
	formData: FormData
): Promise<ProductState> {
	const validatedFields = productActionSchema.safeParse({
		name: formData.get('name'),
		description: formData.get('description'),
		price: parseFloat(formData.get('price') as string),
		stock: parseInt(formData.get('stock') as string, 10),
		color_id: formData.get('color_id'),
		size_id: formData.get('size_id'),
		featured: formData.get('featured') === 'true',
		category_id: formData.get('category_id'),
		archived: formData.get('archived') === 'true',
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Invalid product data. Please check the form fields.',
		};
	}

	try {
		const {
			name,
			description,
			price,
			stock,
			featured,
			archived,
			color_id: colorId,
			size_id: sizeId,
			category_id: categoryId,
		} = validatedFields.data;

		// Format data according to the Java backend expectations
		const productData = {
			name,
			description,
			price,
			stock,
			featured,
			archived,
			colorId,
			sizeId,
			categoryId,
		};

		// Update the product via API
		const response = await axiosInstance.put(
			`${PRODUCT_API}/${id}`,
			productData
		);

		if (!response.data || !response.data.success) {
			throw new Error('Failed to update product');
		}
	} catch (error: any) {
		console.error(error);

		// Handle API error format
		if (error.response?.data) {
			const apiError = error.response.data;

			if (!apiError.success && apiError.errors) {
				// Map API field errors to our error format
				const fieldErrors: Record<string, string[]> = {};

				for (const [field, message] of Object.entries(apiError.errors)) {
					fieldErrors[field] = [message as string];
				}

				return {
					errors: fieldErrors,
					message: apiError.message || 'Failed to update product.',
				};
			}

			return { message: apiError.message || 'Failed to update product.' };
		}

		return { message: error.message || 'Error: Failed to update product.' };
	}

	revalidatePath('/products');
	redirect('/products');
}

export async function deleteProduct(id: string): Promise<DeleteState> {
	try {
		// Delete the product via API
		const response = await axiosInstance.delete(`${PRODUCT_API}/${id}`);

		if (response.data && !response.data.success) {
			return {
				message: response.data.message || 'Failed to delete product.',
				success: false,
			};
		}
	} catch (error: any) {
		if (error.response?.data) {
			return {
				message: error.response.data.message || 'Failed to delete product.',
				success: false,
			};
		}

		return {
			message: error.message || 'Failed to delete product.',
			success: false,
		};
	}

	revalidatePath('/products', 'layout');
	return {
		message: 'Product Was Deleted Successfully.',
		success: true,
	};
}

export async function toggleArchiveProduct(id: string): Promise<DeleteState> {
	try {
		// Toggle the archive status of the product via API
		const response = await axiosInstance.patch(
			`${PRODUCT_API}/${id}/toggle-archive`
		);

		if (response.data && !response.data.success) {
			return {
				message:
					response.data.message || 'Failed to toggle product archive status.',
				success: false,
			};
		}
	} catch (error: any) {
		if (error.response?.data) {
			return {
				message:
					error.response.data.message ||
					'Failed to toggle product archive status.',
				success: false,
			};
		}

		return {
			message: error.message || 'Failed to toggle product archive status.',
			success: false,
		};
	}

	revalidatePath('/products', 'layout');
	return {
		message: 'Product archive status was toggled successfully.',
		success: true,
	};
}
