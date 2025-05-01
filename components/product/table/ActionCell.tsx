'use client';
import { ProductALL } from '@/types/db';
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
import { DeleteProduct } from './DeleteProduct';

export default function ActionCell({
	product,
	...props
}: {
	product: ProductALL;
}) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
					<DropdownMenuItem
						onClick={() => navigator.clipboard.writeText(product.id)}
					>
						Copy product ID
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem className='p-0'>
						<Link
							href={`/products/edit/${product.id}`}
							className='px-2 py-1.5 w-full'
						>
							Edit Product
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => setIsDeleteDialogOpen(true)}
						className='cursor-pointer'
					>
						Delete Product
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<DeleteProduct
				id={product.id}
				open={isDeleteDialogOpen}
				setOpen={setIsDeleteDialogOpen}
			/>
		</Dialog>
	);
}
