'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { BarChart } from '@tremor/react';

// Mock data - in a real app, this would be fetched based on timeRange
const topProductsData = [
	{ name: 'Smartphone X', sales: 420 },
	{ name: 'Wireless Earbuds', sales: 312 },
	{ name: 'Laptop Pro', sales: 287 },
	{ name: 'Smart Watch', sales: 256 },
	{ name: 'Tablet Mini', sales: 198 },
];

interface TopSellingProductsProps {
	timeRange: string;
}

export default function TopSellingProducts({
	timeRange,
}: TopSellingProductsProps) {
	const numberFormatter = (value: number) => value.toLocaleString();

	return (
		<Card className='col-span-1'>
			<CardHeader>
				<CardTitle>Top Selling Products</CardTitle>
				<CardDescription>
					Best performing products by sales volume
				</CardDescription>
			</CardHeader>
			<CardContent>
				<BarChart
					className='h-72'
					data={topProductsData}
					index='name'
					categories={['sales']}
					colors={['blue']}
					valueFormatter={numberFormatter}
					layout='vertical'
					showAnimation={true}
					showLegend={false}
					yAxisWidth={140}
				/>
			</CardContent>
		</Card>
	);
}
