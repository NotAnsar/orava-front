import ProductFormClient from '@/components/product/ProductFormClient';
import {
	fetchCategories,
	fetchColors,
	fetchProductWithImages,
	fetchSizes,
} from '@/lib/product';
import { notFound } from 'next/navigation';

export default async function page({
	params: { id },
}: {
	params: { id: string };
}) {
	const [colors, sizes, categories, product] = await Promise.all([
		fetchColors(),
		fetchSizes(),
		fetchCategories(),
		fetchProductWithImages(id),
	]);

	if (!product) notFound();

	return (
		<ProductFormClient
			categories={categories}
			colors={colors}
			product={product}
			sizes={sizes}
		/>
	);
}
