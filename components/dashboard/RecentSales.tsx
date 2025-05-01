import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { generateAvatarFallback, recentSales } from '@/config/dashboard';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';

export default function RecentSales({ className }: { className?: string }) {
	return (
		<Card x-chunk='dashboard-01-chunk-5' className={className}>
			<CardHeader>
				<CardTitle className='flex justify-between items-end '>
					<span>Recent Orders</span>

					<Link
						href='/orders'
						className={cn(buttonVariants({ size: 'sm' }), 'ml-auto gap-1')}
					>
						View All
						<ArrowUpRight className='h-4 w-4' />
					</Link>
				</CardTitle>
			</CardHeader>
			<CardContent className=' px-0'>
				{recentSales.map((sale) => (
					<div
						className='flex items-center py-4 px-6 gap-4 hover:bg-foreground/5 cursor-pointer border-y border-transparent hover:border-border'
						key={sale.email}
					>
						<Avatar className='hidden h-9 w-9 sm:flex'>
							<AvatarFallback>
								{generateAvatarFallback(sale.firstName, sale.lastName)}
							</AvatarFallback>
						</Avatar>
						<div className='grid gap-1'>
							<p className='text-sm font-medium leading-none'>
								{sale.firstName} {sale.lastName}
							</p>
							<p className='text-sm text-muted-foreground'>{sale.email}</p>
						</div>
						<div className='ml-auto font-medium'>{sale.amount}</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
