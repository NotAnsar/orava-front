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
const inventoryLevelData = [
	{ name: 'Smartphone X', stock: 42, threshold: 30 },
	{ name: 'Wireless Earbuds', stock: 18, threshold: 25 },
	{ name: 'Laptop Pro', stock: 31, threshold: 20 },
	{ name: 'Smart Watch', stock: 12, threshold: 15 },
	{ name: 'Tablet Mini', stock: 8, threshold: 20 },
	{ name: 'Bluetooth Speaker', stock: 22, threshold: 15 },
];

interface InventoryStatusProps {
	timeRange: string;
}

export default function InventoryStatus({ timeRange }: InventoryStatusProps) {
	const numberFormatter = (value: number) => value.toLocaleString();

	return (
		<Card className='col-span-1'>
			<CardHeader>
				<CardTitle>Inventory Status</CardTitle>
				<CardDescription>Current stock levels vs. threshold</CardDescription>
			</CardHeader>
			<CardContent>
				<BarChart
					className='h-72'
					data={inventoryLevelData}
					index='name'
					categories={['stock', 'threshold']}
					colors={['blue', 'red']}
					valueFormatter={numberFormatter}
					layout='vertical'
					showAnimation={true}
					showLegend={true}
					yAxisWidth={140}
				/>
			</CardContent>
		</Card>
	);
}
