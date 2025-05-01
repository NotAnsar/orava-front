import AnalyticCards, {
	AnalyticCardsSkeleton,
} from '@/components/dashboard/AnalyticCards';
import BarChartRevenue from '@/components/dashboard/BarChartRevenue';
import InventoryAlert from '@/components/dashboard/InventoryAlert';
import PieChartCategories from '@/components/dashboard/PieChartCategories';
import RecentSales from '@/components/dashboard/RecentSales';

import { Suspense } from 'react';

export default async function Home() {
	return (
		<main className='flex flex-1 flex-col gap-4 md:gap-8'>
			<div className='grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4'>
				<Suspense fallback={<AnalyticCardsSkeleton />}>
					<AnalyticCards />
				</Suspense>
			</div>
			<div className='grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-5'>
				<BarChartRevenue className='xl:col-span-3' />
				<RecentSales className='xl:col-span-2' />
			</div>
			<div className='grid gap-4 md:gap-8 lg:grid-cols-2'>
				<InventoryAlert />
				<PieChartCategories />
			</div>
		</main>
	);
}
