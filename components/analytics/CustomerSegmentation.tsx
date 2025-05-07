'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { AreaChart } from '@tremor/react';

// Mock data - in a real app, this would be fetched based on timeRange
const customerSegmentData = [
	{ month: 'Jan', new: 85, returning: 120 },
	{ month: 'Feb', new: 92, returning: 145 },
	{ month: 'Mar', new: 118, returning: 162 },
	{ month: 'Apr', new: 108, returning: 190 },
	{ month: 'May', new: 132, returning: 213 },
	{ month: 'Jun', new: 124, returning: 252 },
];

interface CustomerSegmentationProps {
	timeRange: string;
}

export default function CustomerSegmentation({
	timeRange,
}: CustomerSegmentationProps) {
	const numberFormatter = (value: number) => value.toLocaleString();

	return (
		<Card className='col-span-1'>
			<CardHeader>
				<CardTitle>New vs. Returning Customers</CardTitle>
				<CardDescription>Customer acquisition and retention</CardDescription>
			</CardHeader>
			<CardContent>
				<AreaChart
					className='h-72'
					data={customerSegmentData}
					index='month'
					categories={['new', 'returning']}
					colors={['emerald', 'violet']}
					valueFormatter={numberFormatter}
					showAnimation={true}
					showLegend={true}
					stack={true}
				/>
			</CardContent>
		</Card>
	);
}
