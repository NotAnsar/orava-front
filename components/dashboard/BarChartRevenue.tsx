'use client';

import { cn } from '@/lib/utils';
import { BarChart } from '@tremor/react';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';

export default function BarChartRevenue({ className }: { className?: string }) {
	return (
		<Card className={cn('rounded-lg flex flex-col gap-2', className)}>
			<CardHeader className='px-4 md:px-6'>
				<CardTitle className='dark:text-foreground text-foreground text-2xl font-semibold leading-none tracking-tight flex justify-between items-end '>
					Revenue for Last Months
				</CardTitle>
				<CardDescription className='dark:text-muted-foreground text-muted-foreground text-sm mt-2'>
					Gain insights into recent revenue sales trends to inform strategic
					decisions.
				</CardDescription>
			</CardHeader>

			<BarChart
				className='h-56 sm:h-80 lg:h-full px-4 sm:px-6 pb-6'
				data={chartdata}
				index='date'
				showAnimation={true}
				categories={['Sales']}
				colors={['blue']}
				valueFormatter={valueFormatter}
				yAxisWidth={30}
			/>
		</Card>
	);
}

const chartdata = [
	{ date: 'Jan', Sales: 2500 },
	{ date: 'Feb', Sales: 2400 },
	{ date: 'Mar', Sales: 2500 },
	{ date: 'Apr', Sales: 1800 },
	{ date: 'May', Sales: 1700 },
	{ date: 'Jun', Sales: 2000 },
];

function valueFormatter(number: number) {
	const formatter = new Intl.NumberFormat('en-US', {
		maximumFractionDigits: 0,
		notation: 'compact',
		compactDisplay: 'short',
		style: 'currency',
		currency: 'USD',
	});

	return formatter.format(number);
}
