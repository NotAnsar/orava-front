import { fetchUsers } from '@/lib/user';
import React from 'react';
import EditOrderForm from './EditOrderForm';
import { fetchOrderById } from '@/lib/order';
import { notFound } from 'next/navigation';
import { fetchProducts } from '@/lib/product';

export default async function page({
	params: { id },
}: {
	params: { id: string };
}) {
	const [users, order, products] = await Promise.all([
		fetchUsers().then((users) => users.filter((user) => user.role === 'user')),
		fetchOrderById(id),
		fetchProducts(),
	]);

	if (!order) notFound();

	return (
		<EditOrderForm
			users={users}
			id={id}
			initialData={order}
			products={products}
		/>
	);
}
