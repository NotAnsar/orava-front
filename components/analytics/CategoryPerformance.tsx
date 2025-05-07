'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { DonutChart } from '@tremor/react';

// Mock data - in a real app, this would be fetched based on timeRange
const categoryData = [
	{ category: 'Electronics', sales: 45000 },
	{ category: 'Clothing', sales: 31000 },
	{ category: 'Home & Kitchen', sales: 26500 },
	{ category: 'Sports', sales: 17800 },
	{ category: 'Books', sales: 12300 },
];

interface CategoryPerformanceProps {
	timeRange: string;
}

export default function CategoryPerformance({
	timeRange,
}: CategoryPerformanceProps) {
	const dollarFormatter = (value: number) => `$${value.toLocaleString()}`;

	return (
		<Card className='col-span-1'>
			<CardHeader>
				<CardTitle>Category Performance</CardTitle>
				<CardDescription>Revenue by product category</CardDescription>
			</CardHeader>
			<CardContent>
				<DonutChart
					className='h-72'
					data={categoryData}
					category='sales'
					index='category'
					valueFormatter={dollarFormatter}
					colors={['blue', 'violet', 'indigo', 'rose', 'cyan']}
					showAnimation={true}
					showLabel={false}
					showTooltip={true}
				/>
			</CardContent>
		</Card>
	);
}
