import ProductFormClient from '@/components/product/ProductFormClient';
import { fetchCategories, fetchColors, fetchSizes } from '@/lib/product';

export default async function page() {
	const [colors, sizes, categories] = await Promise.all([
		fetchColors(),
		fetchSizes(),
		fetchCategories(),
	]);

	return (
		<ProductFormClient categories={categories} colors={colors} sizes={sizes} />
	);
}
