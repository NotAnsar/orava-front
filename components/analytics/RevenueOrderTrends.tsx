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
const salesTrendData = [
	{ date: 'Jan', revenue: 4200, orders: 42 },
	{ date: 'Feb', revenue: 3800, orders: 38 },
	{ date: 'Mar', revenue: 6200, orders: 67 },
	{ date: 'Apr', revenue: 8100, orders: 81 },
	{ date: 'May', revenue: 7400, orders: 79 },
	{ date: 'Jun', revenue: 9100, orders: 95 },
];

interface RevenueOrderTrendsProps {
	timeRange: string;
}

export default function RevenueOrderTrends({
	timeRange,
}: RevenueOrderTrendsProps) {
	// Value formatters
	const dollarFormatter = (value: number) => `$${value.toLocaleString()}`;
	const numberFormatter = (value: number) => value.toLocaleString();

	// In a real app, you'd fetch data based on timeRange
	// const data = useMemo(() => fetchDataForTimeRange(timeRange), [timeRange]);

	return (
		<Card className='col-span-1'>
			<CardHeader>
				<CardTitle>Revenue & Order Trends</CardTitle>
				<CardDescription>Monthly sales and order volume</CardDescription>
			</CardHeader>
			<CardContent>
				<AreaChart
					className='h-72'
					data={salesTrendData}
					index='date'
					categories={['revenue', 'orders']}
					colors={['indigo', 'cyan']}
					valueFormatter={(value: number, category?: string) => {
						if (category === 'revenue') return dollarFormatter(value);
						return numberFormatter(value);
					}}
					yAxisWidth={60}
					showAnimation={true}
					showLegend={true}
				/>
			</CardContent>
		</Card>
	);
}
