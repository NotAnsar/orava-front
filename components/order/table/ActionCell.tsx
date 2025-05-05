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
import { Dialog } from '@radix-ui/react-dialog';
import { Order } from '@/types/order';

export default function ActionCell({ order, ...props }: { order: Order }) {
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
				</DropdownMenuContent>
			</DropdownMenu>
		</Dialog>
	);
}
