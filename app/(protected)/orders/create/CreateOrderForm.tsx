'use client';

import { Button } from '@/components/ui/button';
import { Loader, Plus } from 'lucide-react';
import BreadCrumb from '@/components/BreadCrumb';
import { useFormState, useFormStatus } from 'react-dom';
import OrderForm from '../../../../components/order/OrderItems';
import { createOrder, OrderFormState } from '@/actions/order-action';
import { User } from '@/types/user';
import OrderDetails from '@/components/order/OrderDetails';
import OrderItems from '../../../../components/order/OrderItems';
import { ProductALL } from '@/types/db';

export default function CreateOrderForm({
	users,
	products,
}: {
	users: User[];
	products: ProductALL[];
}) {
	const initialState: OrderFormState = { message: null, errors: {} };
	const [state, action] = useFormState(createOrder, initialState);

	return (
		<form action={action}>
			<div className='flex gap-4 flex-col sm:flex-row justify-between'>
				<BreadCrumb
					items={[
						{ link: '/orders', text: 'Orders' },
						{
							link: '/orders/create',
							text: 'Create Order',
							isCurrent: true,
						},
					]}
				/>

				<PendingButton />
			</div>
			{(state?.message || state?.errors) && (
				<p className='text-sm font-medium text-destructive'>{state.message}</p>
			)}
			<div className='mt-5 grid gap-6'>
				<OrderDetails state={state} users={users} />
				<OrderItems state={state} products={products} />
			</div>
		</form>
	);
}

export function PendingButton() {
	const { pending } = useFormStatus();

	return (
		<Button
			className='flex gap-1 justify-center items-center'
			type='submit'
			aria-disabled={pending}
			disabled={pending}
		>
			{pending ? (
				<Loader className='mr-2 h-4 w-4 animate-spin' />
			) : (
				<Plus className='w-4 h-auto' />
			)}
			Create Order
		</Button>
	);
}
