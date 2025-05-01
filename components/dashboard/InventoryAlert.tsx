import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../ui/card';

import Link from 'next/link';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../ui/table';
import { fetchLowestInStock } from '@/lib/dashboard';
import Badge from '../Badge';
import { Archive, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';

export default async function InventoryAlert({
	className,
}: {
	className?: string;
}) {
	const products = await fetchLowestInStock();
	return (
		<Card x-chunk='dashboard-01-chunk-5' className={className}>
			<CardHeader>
				<CardTitle className='flex justify-between items-end '>
					<span>Inventory Alert</span>

					<Link
						href='/products'
						className={cn(buttonVariants({ size: 'sm' }), 'ml-auto gap-1')}
					>
						View All
						<ArrowUpRight className='h-4 w-4' />
					</Link>
				</CardTitle>

				<CardDescription>
					Some of your products are out of stock and running low in inventory
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Product</TableHead>
							<TableHead className='hidden sm:table-cell'>Price</TableHead>
							<TableHead className='hidden sm:table-cell'>Status</TableHead>
							<TableHead className='text-right'>Stock</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{products.map((p) => (
							<TableRow key={p.id}>
								<TableCell>
									<div className='font-medium'>{p.name}</div>
									<div className='hidden text-sm text-muted-foreground md:inline'>
										{p.category.name}
									</div>
								</TableCell>
								<TableCell className='hidden sm:table-cell'>
									${p.price.toFixed(2)}
								</TableCell>

								<TableCell className='hidden sm:table-cell'>
									<Badge variant={p.archived ? 'archive' : 'success'}>
										{p.archived ? (
											<>
												<Archive className='w-3 h-auto' /> Archived
											</>
										) : (
											<>
												<ShieldCheck className='w-3 h-auto' /> Active
											</>
										)}
									</Badge>
								</TableCell>

								<TableCell className={'text-right font-medium'}>
									{p.stock}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
