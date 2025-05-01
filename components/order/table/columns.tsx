'use client';

import { OrderWithItems } from '@/types/db';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../../ui/button';
import {
	Archive,
	ArrowUpDown,
	Loader,
	RefreshCcw,
	ShieldCheck,
} from 'lucide-react';
import Badge from '../../Badge';
import { generateAvatarFallback } from '@/config/dashboard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatTimestamp } from '@/lib/utils';
import ActionCell from './ActionCell';

export const columns: ColumnDef<OrderWithItems>[] = [
	{
		accessorKey: 'user_name',
		accessorFn: (row) => row.user.firstName + ' ' + row.user.lastName,
		enableHiding: false,
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					className='pl-0'
				>
					User
					<ArrowUpDown className='ml-2 h-4 w-4' />
				</Button>
			);
		},
		cell: ({ row }) => {
			const user = row.original.user;

			return (
				<div className='flex items-center gap-4 '>
					<Avatar className='hidden h-9 w-9 sm:flex'>
						<AvatarFallback>
							{generateAvatarFallback(
								user?.firstName || '',
								user?.lastName || ''
							)}
						</AvatarFallback>
					</Avatar>
					<div className='grid gap-1'>
						<p className='text-sm font-medium leading-none'>
							{user?.firstName} {user?.lastName}
						</p>
						<p className='text-sm text-muted-foreground'>{user?.email}</p>
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: 'user',
		enableHiding: false,
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					className='pl-0'
				>
					Products
					<ArrowUpDown className='ml-2 h-4 w-4' />
				</Button>
			);
		},
		cell: ({ row }) => {
			const order_Items = row.original.order_Items;

			return (
				<div className='grid gap-1'>
					{order_Items.map((item) => (
						<p className='text-sm font-medium leading-none' key={item.id}>
							{item.product.name}
							<span className='text-muted-foreground'>{' * '}</span>
							{item.quantity}
						</p>
					))}
				</div>
			);
		},
	},
	{
		accessorKey: 'total',
		enableHiding: false,
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Total
					<ArrowUpDown className='ml-2 h-4 w-4' />
				</Button>
			);
		},
		cell: ({ row }) => {
			const price = parseFloat(row.getValue('total'));
			const formatted = new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}).format(price);

			return <div className='font-medium pl-4'>{formatted}</div>;
		},
	},

	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const status = row.getValue('status') as string;

			let variant: 'success' | 'error' | 'archive' | 'admin';
			let IconComponent;
			switch (status) {
				case 'pending':
					variant = 'archive';
					IconComponent = RefreshCcw;
					break;
				case 'shipped':
					variant = 'admin';
					IconComponent = ArrowUpDown;

					break;
				case 'delivered':
					variant = 'success';
					IconComponent = ShieldCheck;
					break;
				case 'canceled':
					variant = 'error';
					IconComponent = Archive;
					break;
				default:
					variant = 'archive';
					IconComponent = Loader;
			}

			return (
				<Badge variant={variant}>
					<IconComponent className='w-3 h-auto' />
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: 'createdAt',
		header: 'Ordered At',
		cell: ({ row }) => {
			return (
				<div className='text-sm text-nowrap'>
					{formatTimestamp(row.getValue('createdAt'), true)}
				</div>
			);
		},
	},
	{
		id: 'actions',
		enableHiding: false,
		cell: ({ row }) => <ActionCell order={row.original} />,
	},
];
