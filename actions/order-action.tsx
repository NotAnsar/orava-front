'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Remove Supabase imports and use dummy data

const orderSchema = z.object({
	user_id: z.string({ message: 'Please provide a valid User.' }),
	status: z.enum(['pending', 'shipped', 'delivered', 'canceled'], {
		message:
			'Status must be either "pending", "shipped", "delivered", or "canceled".',
	}),
	total: z.coerce
		.number()
		.positive({ message: 'Price must be a positive number' }),
	order_Items: z.array(
		z.object({
			product_id: z.string({ message: 'Please provide a valid Product ID.' }),
			quantity: z.coerce
				.number()
				.positive({ message: 'Quantity must be a positive number' }),
			unit_price: z.coerce
				.number()
				.positive({ message: 'Unit price must be a positive number' }),
		})
	),
});

export type OrderFormState = {
	errors?: {
		user_id?: string[];
		status?: string[];
		total?: string[];
		order_Items?: Array<{
			product_id?: string[];
			quantity?: string[];
			unit_price?: string[];
		}>;
	};
	message?: string | null;
};

// In-memory storage for dummy orders
let dummyOrders: any[] = [];
let orderId = 4; // Starting ID (since we had 3 dummy orders before)

export async function createOrder(
	prevState: OrderFormState,
	formData: FormData
): Promise<OrderFormState> {
	const validatedFields = orderSchema.safeParse({
		user_id: formData.get('user_id'),
		status: formData.get('status'),
		total: formData.get('total'),
		order_Items: JSON.parse(formData.get('order_Items') as string),
	});

	if (!validatedFields.success) {
		const fieldErrors = formatOrderItemErrors(
			validatedFields.error.flatten().fieldErrors
		);
		return {
			errors: fieldErrors,
			message: 'Validation failed. Please check your order items.',
		};
	}

	try {
		const { status, total, user_id, order_Items } = validatedFields.data;

		// Create a new order with dummy data
		const newOrder = {
			id: String(orderId++),
			createdAt: new Date().toISOString(),
			status,
			total,
			user_id,
			order_Items: order_Items.map((item, index) => ({
				id: `item_${orderId}_${index}`,
				product_id: item.product_id,
				quantity: item.quantity,
				unit_price: item.unit_price,
				createdAt: new Date().toISOString(),
				order_id: String(orderId - 1),
			})),
		};

		dummyOrders.push(newOrder);
		console.log('Order created:', newOrder);
	} catch (error) {
		console.error(error);
		return { message: 'Error: Failed to Create Order Data.' };
	}

	revalidatePath('/', 'layout');
	redirect('/orders');
}

export async function updateOrder(
	id: string,
	prevState: OrderFormState,
	formData: FormData
): Promise<OrderFormState> {
	const validatedFields = orderSchema.safeParse({
		user_id: formData.get('user_id'),
		status: formData.get('status'),
		total: formData.get('total'),
		order_Items: JSON.parse(formData.get('order_Items') as string),
	});

	if (!validatedFields.success) {
		const fieldErrors = formatOrderItemErrors(
			validatedFields.error.flatten().fieldErrors
		);
		return {
			errors: fieldErrors,
			message: 'Validation failed. Please check your order items.',
		};
	}

	try {
		const { status, total, user_id, order_Items } = validatedFields.data;

		// Find and update the order in our dummy data
		const orderIndex = dummyOrders.findIndex((order) => order.id === id);
		if (orderIndex !== -1) {
			dummyOrders[orderIndex] = {
				...dummyOrders[orderIndex],
				status,
				total,
				user_id,
				order_Items: order_Items.map((item, index) => ({
					id: `item_${id}_${index}`,
					product_id: item.product_id,
					quantity: item.quantity,
					unit_price: item.unit_price,
					order_id: id,
				})),
			};
			console.log('Order updated:', dummyOrders[orderIndex]);
		}
	} catch (error) {
		console.error(error);
		return { message: 'Error: Failed to Update Order.' };
	}

	revalidatePath('/orders', 'layout');
	redirect('/orders');
}

export type DeleteOrderState = {
	message?: string | null;
	type?: string | null;
};

export async function deleteOrder(id: string) {
	try {
		// Remove order from dummy data
		const initialLength = dummyOrders.length;
		dummyOrders = dummyOrders.filter((order) => order.id !== id);

		if (dummyOrders.length === initialLength) {
			throw new Error(`Order with ID ${id} not found`);
		}

		console.log(`Order ${id} deleted`);
	} catch (error) {
		console.error(error);
		return {
			message: `Failed to delete order: ${(error as Error).message}`,
			type: 'error',
		};
	}

	revalidatePath('/orders', 'layout');
	return { message: 'Order Was Deleted Successfully.' };
}

function formatOrderItemErrors(fieldErrors: any) {
	if (fieldErrors?.order_Items) {
		fieldErrors.order_Items = fieldErrors.order_Items.map(
			(item: any, index: number) => {
				const messages: Record<string, string[]> = {};
				for (const [field, errors] of Object.entries(item)) {
					messages[field] = (errors as string[]).map(
						(msg) => `Item ${index + 1}: ${msg}`
					);
				}
				return messages;
			}
		);
	}
	return fieldErrors;
}
