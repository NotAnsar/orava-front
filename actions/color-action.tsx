'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const formSchema = z.object({
	name: z
		.string()
		.min(1, 'Color Name is required')
		.max(50, 'Color Name must be at most 50 characters'),
	value: z
		.string()
		.regex(
			/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
			'Color Value must be a valid hexadecimal color code (e.g., #ffffff or #fff)'
		),
});

export type ColorState =
	| {
			errors?: {
				name?: string[];
				value?: string[];
			};
			message?: string | null;
	  }
	| undefined;

// In-memory storage for dummy colors
let dummyColors = [
	{
		id: '1',
		name: 'Red',
		value: '#FF0000',
		createdAt: new Date().toISOString(),
	},
	{
		id: '2',
		name: 'Blue',
		value: '#0000FF',
		createdAt: new Date().toISOString(),
	},
	{
		id: '3',
		name: 'Black',
		value: '#000000',
		createdAt: new Date().toISOString(),
	},
];
let colorId = 4; // Starting ID for new colors

export async function createColor(prevState: ColorState, formData: FormData) {
	const validatedFields = formSchema.safeParse({
		name: formData.get('name'),
		value: formData.get('value'),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Invalid Credentials. Unable to Create Product Color.',
		};
	}

	const { name, value } = validatedFields.data;
	try {
		// Create a new color in our dummy data
		const newColor = {
			id: String(colorId++),
			name,
			value,
			createdAt: new Date().toISOString(),
		};

		dummyColors.push(newColor);
		console.log('Color created:', newColor);
	} catch (error) {
		console.error(error);
		return { message: 'Error: Failed to Create Product Color.' };
	}

	revalidatePath('/categories', 'layout');
	return { message: 'Color created successfully.' };
}

export async function updateColor(
	id: string,
	prevState: ColorState,
	formData: FormData
) {
	const validatedFields = formSchema.safeParse({
		name: formData.get('name'),
		value: formData.get('value'),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Invalid Credentials. Unable to Update Product Color.',
		};
	}

	const { name, value } = validatedFields.data;
	try {
		// Find and update color in dummy data
		const colorIndex = dummyColors.findIndex((color) => color.id === id);
		if (colorIndex !== -1) {
			dummyColors[colorIndex] = {
				...dummyColors[colorIndex],
				name,
				value,
			};
			console.log('Color updated:', dummyColors[colorIndex]);
		} else {
			throw new Error(`Color with ID ${id} not found`);
		}
	} catch (error) {
		console.error(error);
		return {
			message: `Error: Failed to Update Product Color. ${
				(error as Error).message
			}`,
		};
	}

	revalidatePath('/categories', 'layout');
	return { message: 'Color updated successfully.' };
}

export type DeleteColorState = {
	message?: string | null;
	type?: string | null;
};

export async function deleteColor(id: string) {
	try {
		// Filter out the color to be deleted
		const initialLength = dummyColors.length;
		dummyColors = dummyColors.filter((color) => color.id !== id);

		if (dummyColors.length === initialLength) {
			throw new Error(`Color with ID ${id} not found`);
		}

		console.log(`Color ${id} deleted`);
	} catch (error) {
		console.error(error);
		return {
			message: `Failed to delete color: ${(error as Error).message}`,
			type: 'error',
		};
	}

	revalidatePath('/categories', 'layout');
	return { message: 'Product Color Was Deleted Successfully.' };
}
