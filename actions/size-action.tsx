'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const formSchema = z.object({
	name: z
		.string()
		.min(1, { message: 'Size Name must be at least 1 characters long.' }),
	fullname: z
		.string()
		.min(3, { message: 'Size Full Name must be at least 3 characters long.' }),
});

export type SizeState =
	| {
			errors?: {
				name?: string[];
				fullname?: string[];
			};
			message?: string | null;
	  }
	| undefined;

// In-memory storage for dummy sizes
let dummySizes = [
	{
		id: '1',
		name: 'S',
		fullname: 'Small',
		createdAt: new Date().toISOString(),
	},
	{
		id: '2',
		name: 'M',
		fullname: 'Medium',
		createdAt: new Date().toISOString(),
	},
	{
		id: '3',
		name: 'L',
		fullname: 'Large',
		createdAt: new Date().toISOString(),
	},
];
let sizeId = 4; // Starting ID for new sizes

export async function createSize(prevState: SizeState, formData: FormData) {
	const validatedFields = formSchema.safeParse({
		name: formData.get('name'),
		fullname: formData.get('fullname'),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Invalid Credentials. Unable to Create Product size.',
		};
	}

	const { fullname, name } = validatedFields.data;
	try {
		// Create a new size in our dummy data
		const newSize = {
			id: String(sizeId++),
			name,
			fullname,
			createdAt: new Date().toISOString(),
		};

		dummySizes.push(newSize);
		console.log('Size created:', newSize);
	} catch (error) {
		console.error(error);
		return { message: 'Error: Failed to Create Product Size.' };
	}

	revalidatePath('/sizes', 'layout');
	return { message: 'Size created successfully.' };
}

export async function updateSize(
	id: string,
	prevState: SizeState,
	formData: FormData
) {
	const validatedFields = formSchema.safeParse({
		name: formData.get('name'),
		fullname: formData.get('fullname'),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Invalid Credentials. Unable to Update Product Size.',
		};
	}

	const { fullname, name } = validatedFields.data;
	try {
		// Find and update size in dummy data
		const sizeIndex = dummySizes.findIndex((size) => size.id === id);
		if (sizeIndex !== -1) {
			dummySizes[sizeIndex] = {
				...dummySizes[sizeIndex],
				name,
				fullname,
			};
			console.log('Size updated:', dummySizes[sizeIndex]);
		} else {
			throw new Error(`Size with ID ${id} not found`);
		}
	} catch (error) {
		console.error(error);
		return {
			message: `Error: Failed to Update Product Size. ${
				(error as Error).message
			}`,
		};
	}

	revalidatePath('/sizes', 'layout');
	return { message: 'Size updated successfully.' };
}

export type DeleteSizeState = {
	message?: string | null;
	type?: string | null;
};

export async function deleteSize(id: string) {
	try {
		// Filter out the size to be deleted
		const initialLength = dummySizes.length;
		dummySizes = dummySizes.filter((size) => size.id !== id);

		if (dummySizes.length === initialLength) {
			throw new Error(`Size with ID ${id} not found`);
		}

		console.log(`Size ${id} deleted`);
	} catch (error) {
		console.error(error);
		return {
			message: `Failed to delete size: ${(error as Error).message}`,
			type: 'error',
		};
	}

	revalidatePath('/sizes', 'layout');
	return { message: 'Product Size Was Deleted Successfully.' };
}
