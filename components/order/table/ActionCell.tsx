'use client';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Button } from '../../ui/button';
import { MoreHorizontalIcon } from 'lucide-react';

import { useState } from 'react';
import { Dialog } from '@radix-ui/react-dialog';
import Link from 'next/link';
import { DeleteOrder } from './DeleteOrder';
import { Order } from '@/types/order';

export default function ActionCell({ order, ...props }: { order: Order }) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const { id, userId } = order;

	return (
		<Dialog>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant='ghost' className='h-8 w-8 p-0'>
						<span className='sr-only'>Open menu</span>
						<MoreHorizontalIcon className='h-4 w-4' />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end'>
					<DropdownMenuItem onClick={() => navigator.clipboard.writeText(id)}>
						Copy Order ID
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => navigator.clipboard.writeText(userId)}
					>
						Copy User ID
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem className='p-0'>
						<Link href={`/orders/edit/${id}`} className='px-2 py-1.5 w-full'>
							Edit Order
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => setIsDeleteDialogOpen(true)}
						className='cursor-pointer'
					>
						Delete Order
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<DeleteOrder
				id={id}
				open={isDeleteDialogOpen}
				setOpen={setIsDeleteDialogOpen}
			/>
		</Dialog>
	);
}
