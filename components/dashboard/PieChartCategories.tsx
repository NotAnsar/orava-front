'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { DonutChart } from '@tremor/react';
import { cn } from '@/lib/utils';

export default function PieChartCategories({
	className,
}: {
	className?: string;
}) {
	return (
		<Card className={cn('rounded-lg flex flex-col gap-2', className)}>
			<CardHeader>
				<CardTitle className='dark:text-foreground text-foreground text-2xl font-semibold leading-none tracking-tight flex justify-between items-end'>
					Category Sales Performance
				</CardTitle>
				<CardDescription className='dark:text-muted-foreground text-muted-foreground text-sm mt-2'>
					Analyze recent revenue sales trends for each category to make informed
					strategic decisions.
				</CardDescription>
			</CardHeader>

			<DonutChart
				data={datahero}
				className='min-h-80 h-80 lg:min-h-96 lg:h-full p-6'
				variant='pie'
				valueFormatter={dataFormatter}
				onValueChange={(v) => console.log(v)}
				showAnimation
			/>
		</Card>
	);
}

const dataFormatter = (number: number) =>
	`$ ${Intl.NumberFormat('us').format(number).toString()}`;

const datahero = [
	{
		name: 'Noche Holding AG',
		value: 7200,
	},
	{
		name: 'Rain Drop AG',
		value: 4567,
	},
	{
		name: 'Push Rail AG',
		value: 3908,
	},
	{
		name: 'Anton Resorts Holding',
		value: 1398,
	},
];
