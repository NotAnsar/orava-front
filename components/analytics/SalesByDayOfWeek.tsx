'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { BarChart, LineChart } from '@tremor/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data - in a real app, this would be fetched based on timeRange
const salesByDayData = [
	{ day: 'Monday', sales: 4200, transactions: 142 },
	{ day: 'Tuesday', sales: 3800, transactions: 121 },
	{ day: 'Wednesday', sales: 4100, transactions: 136 },
	{ day: 'Thursday', sales: 4800, transactions: 157 },
	{ day: 'Friday', sales: 5700, transactions: 182 },
	{ day: 'Saturday', sales: 6800, transactions: 214 },
	{ day: 'Sunday', sales: 4900, transactions: 164 },
];

interface SalesByDayOfWeekProps {
	timeRange: string;
}

export default function SalesByDayOfWeek({ timeRange }: SalesByDayOfWeekProps) {
	const dollarFormatter = (value: number) => `$${value.toLocaleString()}`;
	const numberFormatter = (value: number) => value.toLocaleString();

	return (
		<Card className='col-span-1'>
			<CardHeader>
				<CardTitle>Sales by Day of Week</CardTitle>
				<CardDescription>
					Revenue and transaction patterns throughout the week
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue='bar'>
					<div className='flex justify-end mb-4'>
						<TabsList>
							<TabsTrigger value='bar'>Bar</TabsTrigger>
							<TabsTrigger value='line'>Line</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent value='bar'>
						<BarChart
							className='h-80'
							data={salesByDayData}
							index='day'
							categories={['sales']}
							colors={['violet']}
							valueFormatter={dollarFormatter}
							showAnimation={true}
							showLegend={false}
						/>
					</TabsContent>

					<TabsContent value='line'>
						<LineChart
							className='h-80'
							data={salesByDayData}
							index='day'
							categories={['sales', 'transactions']}
							colors={['violet', 'emerald']}
							valueFormatter={(value: number, category?: string) => {
								if (category === 'sales') return dollarFormatter(value);
								return numberFormatter(value);
							}}
							showAnimation={true}
							showLegend={true}
							yAxisWidth={80}
						/>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
