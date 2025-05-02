import { fetchProducts } from '@/lib/product';
import CreateOrderForm from './CreateOrderForm';

import React from 'react';
import { fetchUsers } from '@/api/users';

export default async function page() {
	const [users, products] = await Promise.all([
		fetchUsers().then((users) => users.filter((user) => user.role === 'user')),
		fetchProducts(),
	]);

	return <CreateOrderForm users={users} products={products} />;
}
