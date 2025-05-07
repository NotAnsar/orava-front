'use client';

import { useState } from 'react';
import TimeRangeSelector from '@/components/analytics/TimeRangeSelector';
import RevenueOrderTrends from '@/components/analytics/RevenueOrderTrends';
import CategoryPerformance from '@/components/analytics/CategoryPerformance';
import OrderStatusDistribution from '@/components/analytics/OrderStatusDistribution';
import TopSellingProducts from '@/components/analytics/TopSellingProducts';
import CustomerSegmentation from '@/components/analytics/CustomerSegmentation';
import InventoryStatus from '@/components/analytics/InventoryStatus';
import SalesByDayOfWeek from '@/components/analytics/SalesByDayOfWeek';

export default function Analytics() {
	const [timeRange, setTimeRange] = useState('6months');

	return (
		<main className='flex flex-1 flex-col gap-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-bold'>Advanced Analytics</h1>
				<TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />
			</div>

			{/* First row of charts */}
			<div className='grid gap-6 md:grid-cols-2'>
				<RevenueOrderTrends timeRange={timeRange} />
				<CategoryPerformance timeRange={timeRange} />
			</div>

			{/* Second row of charts */}
			<div className='grid gap-6 md:grid-cols-2'>
				<OrderStatusDistribution timeRange={timeRange} />
				<TopSellingProducts timeRange={timeRange} />
			</div>

			{/* Third row of charts */}
			<div className='grid gap-6 md:grid-cols-2'>
				<CustomerSegmentation timeRange={timeRange} />
				<InventoryStatus timeRange={timeRange} />
			</div>

			{/* Fourth row of charts */}
			<div className='grid gap-6'>
				<SalesByDayOfWeek timeRange={timeRange} />
			</div>
		</main>
	);
}
