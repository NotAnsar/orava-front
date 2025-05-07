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
const orderStatusData = [
	{ status: 'NEW', count: 65 },
	{ status: 'PROCESSING', count: 142 },
	{ status: 'COMPLETED', count: 435 },
	{ status: 'CANCELED', count: 47 },
];

interface OrderStatusDistributionProps {
	timeRange: string;
}

export default function OrderStatusDistribution({
	timeRange,
}: OrderStatusDistributionProps) {
	const numberFormatter = (value: number) => value.toLocaleString();

	return (
		<Card className='col-span-1'>
			<CardHeader>
				<CardTitle>Order Status Distribution</CardTitle>
				<CardDescription>Current orders by status</CardDescription>
			</CardHeader>
			<CardContent>
				<DonutChart
					className='h-72'
					data={orderStatusData}
					category='count'
					index='status'
					valueFormatter={numberFormatter}
					colors={['amber', 'blue', 'green', 'rose']}
					showAnimation={true}
					showLabel={true}
				/>
			</CardContent>
		</Card>
	);
}
