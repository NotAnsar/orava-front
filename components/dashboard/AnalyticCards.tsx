import {
	fetchTotalClients,
	fetchTotalProducts,
	fetchTotalRevenue,
	fetchTotalSales,
} from '@/lib/dashboard';
import CardComponent, { CardComponentSkeleton } from './CardComponent';

export default async function AnalyticCards() {
	const res = await Promise.all([
		fetchTotalClients(),
		fetchTotalProducts(),
		fetchTotalRevenue(),
		fetchTotalSales(),
	]);

	return (
		<>
			{res.map((card) => (
				<CardComponent card={card} key={card.id} />
			))}
		</>
	);
}
export function AnalyticCardsSkeleton() {
	return (
		<>
			{Array.from({ length: 4 }, (_, i) => (
				<CardComponentSkeleton key={i} />
			))}
		</>
	);
}
