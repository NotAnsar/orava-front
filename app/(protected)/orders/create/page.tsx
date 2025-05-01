import { fetchProducts } from '@/lib/product';
import CreateOrderForm from './CreateOrderForm';
import { fetchUsers } from '@/lib/user';
import React from 'react';

export default async function page() {
	const [users, products] = await Promise.all([
		fetchUsers().then((users) => users.filter((user) => user.role === 'user')),
		fetchProducts(),
	]);

	return <CreateOrderForm users={users} products={products} />;
}
