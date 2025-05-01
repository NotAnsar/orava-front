import { columns } from '@/components/order/table/columns';
import { DataTable } from '@/components/order/table/data-table';
import { buttonVariants } from '@/components/ui/button';
import { fetchOrders } from '@/lib/order';
import Link from 'next/link';

export default async function Orders() {
	const orders = await fetchOrders();

	return (
		<>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-bold'>Orders</h1>
				<Link href={'/orders/create'} className={buttonVariants()}>
					Add Order
				</Link>
			</div>

			<DataTable columns={columns} data={orders} />
		</>
	);
}
