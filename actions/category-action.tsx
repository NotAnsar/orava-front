'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const formSchema = z.object({
	name: z
		.string()
		.min(3, { message: 'Category Name must be at least 3 characters long.' }),
});

export type CategoryState =
	| {
			errors?: {
				name?: string[];
			};
			message?: string | null;
	  }
	| undefined;

// In-memory storage for dummy categories
let dummyCategories = [
	{ id: '1', name: 'Shirts', createdAt: new Date().toISOString() },
	{ id: '2', name: 'Pants', createdAt: new Date().toISOString() },
	{ id: '3', name: 'Shoes', createdAt: new Date().toISOString() },
];
let categoryId = 4; // Starting ID for new categories

export async function createCategory(
	prevState: CategoryState,
	formData: FormData
) {
	const validatedFields = formSchema.safeParse({ name: formData.get('name') });

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Invalid Credentials. Unable to Create Product Category.',
		};
	}

	const { name } = validatedFields.data;
	try {
		// Create a new category in our dummy data
		const newCategory = {
			id: String(categoryId++),
			name,
			createdAt: new Date().toISOString(),
		};

		dummyCategories.push(newCategory);
		console.log('Category created:', newCategory);
	} catch (error) {
		console.error(error);
		return { message: 'Error: Failed to Create Product Category.' };
	}

	revalidatePath('/categories', 'layout');
	return { message: 'Category created successfully.' };
}

export async function updateCategory(
	id: string,
	prevState: CategoryState,
	formData: FormData
) {
	const validatedFields = formSchema.safeParse({
		name: formData.get('name'),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Invalid Credentials. Unable to Update Product Category.',
		};
	}

	const { name } = validatedFields.data;
	try {
		// Find and update category in dummy data
		const categoryIndex = dummyCategories.findIndex(
			(category) => category.id === id
		);
		if (categoryIndex !== -1) {
			dummyCategories[categoryIndex] = {
				...dummyCategories[categoryIndex],
				name,
			};
			console.log('Category updated:', dummyCategories[categoryIndex]);
		} else {
			throw new Error(`Category with ID ${id} not found`);
		}
	} catch (error) {
		console.error(error);
		return {
			message: `Error: Failed to Update Product Category. ${
				(error as Error).message
			}`,
		};
	}

	revalidatePath('/categories', 'layout');
	return { message: 'Category updated successfully.' };
}

export type DeleteCategoryState = {
	message?: string | null;
	type?: string | null;
};

export async function deleteCategory(id: string) {
	try {
		// Filter out the category to be deleted
		const initialLength = dummyCategories.length;
		dummyCategories = dummyCategories.filter((category) => category.id !== id);

		if (dummyCategories.length === initialLength) {
			throw new Error(`Category with ID ${id} not found`);
		}

		console.log(`Category ${id} deleted`);
	} catch (error) {
		console.error(error);
		return {
			message: `Failed to delete category: ${(error as Error).message}`,
			type: 'error',
		};
	}

	revalidatePath('/categories', 'layout');
	return { message: 'Product Category Was Deleted Successfully.' };
}
