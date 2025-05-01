// 'use client';

// import { Category, Color, ProductWithImages, Size } from '@/types/db';
// import BreadCrumb from '@/components/BreadCrumb';
// import { Button } from '@/components/ui/button';
// import { Loader, Plus } from 'lucide-react';
// import { z } from 'zod';
// import { UseFormReturn, useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { Form } from '../ui/form';
// import { useState } from 'react';
// import ProductDetails from './form-items/ProductDetails';
// import ProductStock from './form-items/ProductStock';
// import FeaturedProduct from './form-items/FeaturedProduct';
// import ProductCategory from './form-items/ProductCategory';
// import ProductStatus from './form-items/ProductStatus';
// import ProductImages from './form-items/ProductImages';
// import { toast } from '../ui/use-toast';
// import { createClient } from '@/lib/supabase/client';
// import { useRouter } from 'next/navigation';
// import { ProductSchemaType, productSchema } from '@/lib/productSchema';

// export type ProductForm = UseFormReturn<ProductSchemaType, any, undefined>;

// export default function ProductFormClient({
// 	categories,
// 	colors,
// 	sizes,
// 	product,
// }: {
// 	product?: ProductWithImages;
// 	categories: Category[];
// 	colors: Color[];
// 	sizes: Size[];
// }) {
// 	const router = useRouter();
// 	const [isLoading, setIsLoading] = useState<boolean>(false);

// 	const form = useForm<z.infer<typeof productSchema>>({
// 		resolver: zodResolver(productSchema),
// 		defaultValues: {
// 			name: product?.name ?? '',
// 			description: product?.description ?? '',
// 			size_id: product?.size_id ?? sizes.find((s) => s.name === 'M')?.id ?? '',
// 			featured: product?.featured ?? false,
// 			archived: product?.archived ?? false,
// 			category_id: product?.category_id ?? '',
// 			color_id: product?.color_id ?? '',
// 			price: product?.price,
// 			stock: product?.stock,
// 			images: product?.images || [],
// 		},
// 	});

// 	async function onSubmit(values: z.infer<typeof productSchema>) {
// 		setIsLoading(true);
// 		const supabase = createClient();

// 		try {
// 			if (values.featured && values.archived) {
// 				throw new Error('Archived products cannot be featured.');
// 			}
// 			const { images, ...rest } = values;
// 			const productData = { ...rest, description: rest.description || null };

// 			const { data, error } = await (product
// 				? supabase
// 						.from('product')
// 						.update(productData)
// 						.eq('id', product.id)
// 						.select('id')
// 						.single()
// 				: supabase.from('product').insert([productData]).select('id').single());

// 			if (error) throw error;

// 			const productId = data.id as string;

// 			if (product) {
// 				// Get the list of current image filenames in storage
// 				const { data: storedImages, error: listError } = await supabase.storage
// 					.from('product_images')
// 					.list(productId);

// 				if (listError) {
// 					console.error('Error listing stored images:', listError);
// 					throw listError;
// 				}

// 				// Create a set of current image filenames (decoded)
// 				const currentImageSet = new Set(
// 					images.map((i) =>
// 						typeof i === 'string'
// 							? decodeURIComponent(i.split('/').pop() || '')
// 							: i.name
// 					)
// 				);

// 				// Find images to remove
// 				const imagesToRemove = storedImages.filter(
// 					(file) => !currentImageSet.has(file.name)
// 				);
// 				if (imagesToRemove.length > 0) {
// 					const { error: deleteError } = await supabase.storage
// 						.from('product_images')
// 						.remove(imagesToRemove.map((file) => `${productId}/${file.name}`));

// 					if (deleteError) {
// 						console.error('Error deleting images:', deleteError);
// 						throw deleteError;
// 					}
// 				}
// 			}

// 			const newImages = images.filter((i): i is File => i instanceof File);
// 			const uploadResults = await Promise.all(
// 				newImages.map((i) => {
// 					const randomString = Math.random().toString(36).substring(2, 7);
// 					const fName = `${productId}/${i.name.split('.')[0]}_${randomString}`;
// 					return supabase.storage.from('product_images').upload(fName, i);
// 				})
// 			);

// 			const uploadErrors = uploadResults.filter((result) => result.error);
// 			if (uploadErrors.length > 0) {
// 				throw new Error('Some images failed to upload');
// 			}

// 			toast({
// 				title: `Product ${product ? 'updated' : 'created'} successfully`,
// 			});

// 			router.push('/products');
// 			router.refresh();
// 		} catch (error) {
// 			console.error(error);
// 			let message = `Failed to ${product ? 'update' : 'create'} product.`;

// 			if (typeof error === 'object' && error !== null) {
// 				if ('message' in error && typeof error.message === 'string') {
// 					message = error.message;
// 				}
// 			}

// 			toast({
// 				title: 'Error',
// 				description: message,
// 				variant: 'destructive',
// 				duration: 3000,
// 			});
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	}

// 	return (
// 		<Form {...form}>
// 			<form
// 				onSubmit={form.handleSubmit(onSubmit)}
// 				encType='multipart/form-data'
// 			>
// 				<div className='flex gap-4 flex-col sm:flex-row justify-between'>
// 					<BreadCrumb
// 						items={[
// 							{ link: '/products', text: 'Product' },
// 							{
// 								link: product
// 									? `/products/edit/${product.id}`
// 									: '/products/create',
// 								text: `${product ? 'Edit' : 'Create'} Product`,
// 								isCurrent: true,
// 							},
// 						]}
// 					/>

// 					<Button
// 						className='flex gap-1 justify-center items-center'
// 						type='submit'
// 						aria-disabled={isLoading}
// 						disabled={isLoading}
// 					>
// 						{isLoading ? (
// 							<Loader className='mr-2 h-4 w-4 animate-spin' />
// 						) : (
// 							<Plus className='w-4 h-auto' />
// 						)}
// 						{product ? 'Edit Product' : 'Create Product'}
// 					</Button>
// 				</div>

// 				<div className='grid gap-4 lg:gap-y-8 lg:gap-x-0 lg:grid-cols-1 xl:grid-cols-3 xl:gap-8 my-4'>
// 					<div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
// 						<ProductDetails form={form} isLoading={isLoading} />
// 						<ProductStock
// 							colors={colors}
// 							sizes={sizes}
// 							form={form}
// 							isLoading={isLoading}
// 						/>
// 						<FeaturedProduct form={form} isLoading={isLoading} />
// 					</div>
// 					<div className='grid auto-rows-max items-start gap-4 lg:gap-8'>
// 						<ProductCategory
// 							categories={categories}
// 							form={form}
// 							isLoading={isLoading}
// 						/>
// 						<ProductImages form={form} isLoading={isLoading} />
// 						<ProductStatus form={form} isLoading={isLoading} />
// 					</div>
// 				</div>
// 			</form>
// 		</Form>
// 	);
// }

'use client';

import { Category, Color, ProductWithImages, Size } from '@/types/db';
import BreadCrumb from '@/components/BreadCrumb';
import { Button } from '@/components/ui/button';
import { Loader, Plus } from 'lucide-react';
import { z } from 'zod';
import { UseFormReturn, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '../ui/form';
import { useState } from 'react';
import ProductDetails from './form-items/ProductDetails';
import ProductStock from './form-items/ProductStock';
import FeaturedProduct from './form-items/FeaturedProduct';
import ProductCategory from './form-items/ProductCategory';
import ProductStatus from './form-items/ProductStatus';
import ProductImages from './form-items/ProductImages';
import { toast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';
import { ProductSchemaType, productSchema } from '@/lib/productSchema';

export type ProductForm = UseFormReturn<ProductSchemaType, any, undefined>;

// This is a dummy function to simulate product creation/update
async function saveProduct(
	productData: any,
	productId?: string
): Promise<{ id: string }> {
	console.log(
		`${productId ? 'Updating' : 'Creating'} product with data:`,
		productData
	);

	// Simulate a delay to mimic API call
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Return a product ID (either the existing one or a new one)
	return { id: productId || `new-${Date.now()}` };
}

// Simulate image storage operations
async function handleImages(
	images: (string | File)[],
	productId: string,
	existingImages?: string[]
) {
	console.log('Handling images for product:', productId);

	// Simulate a delay
	await new Promise((resolve) => setTimeout(resolve, 300));

	// Process file uploads
	const newImages = images.filter((i): i is File => i instanceof File);
	if (newImages.length > 0) {
		console.log(`Would upload ${newImages.length} new images`);

		// In a real implementation, we'd upload these files to the backend
		for (const image of newImages) {
			console.log(
				`- Would upload image: ${image.name} (${Math.round(
					image.size / 1024
				)}KB)`
			);
		}
	}

	// Handle image deletion (if updating product)
	if (existingImages) {
		const currentImages = images
			.filter((i): i is string => typeof i === 'string')
			.map((url) => decodeURIComponent(url.split('/').pop() || ''));

		const imagesToDelete = existingImages.filter(
			(oldImg) => !currentImages.some((newImg) => newImg.includes(oldImg))
		);

		if (imagesToDelete.length > 0) {
			console.log(`Would delete ${imagesToDelete.length} images`);
			for (const image of imagesToDelete) {
				console.log(`- Would delete image: ${image}`);
			}
		}
	}

	// Return success
	return true;
}

export default function ProductFormClient({
	categories,
	colors,
	sizes,
	product,
}: {
	product?: ProductWithImages;
	categories: Category[];
	colors: Color[];
	sizes: Size[];
}) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const form = useForm<z.infer<typeof productSchema>>({
		resolver: zodResolver(productSchema),
		defaultValues: {
			name: product?.name ?? '',
			description: product?.description ?? '',
			size_id: product?.size_id ?? sizes.find((s) => s.name === 'M')?.id ?? '',
			featured: product?.featured ?? false,
			archived: product?.archived ?? false,
			category_id: product?.category_id ?? '',
			color_id: product?.color_id ?? '',
			price: product?.price,
			stock: product?.stock,
			images: product?.images || [],
		},
	});

	async function onSubmit(values: z.infer<typeof productSchema>) {
		setIsLoading(true);

		try {
			if (values.featured && values.archived) {
				throw new Error('Archived products cannot be featured.');
			}

			const { images, ...rest } = values;
			const productData = { ...rest, description: rest.description || null };

			// Save product data
			const { id: productId } = await saveProduct(productData, product?.id);

			// Handle image uploads and deletions
			await handleImages(images, productId, product?.images);

			toast({
				title: `Product ${product ? 'updated' : 'created'} successfully`,
			});

			router.push('/products');
			router.refresh();
		} catch (error) {
			console.error(error);
			let message = `Failed to ${product ? 'update' : 'create'} product.`;

			if (typeof error === 'object' && error !== null) {
				if ('message' in error && typeof error.message === 'string') {
					message = error.message;
				}
			}

			toast({
				title: 'Error',
				description: message,
				variant: 'destructive',
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				encType='multipart/form-data'
			>
				<div className='flex gap-4 flex-col sm:flex-row justify-between'>
					<BreadCrumb
						items={[
							{ link: '/products', text: 'Product' },
							{
								link: product
									? `/products/edit/${product.id}`
									: '/products/create',
								text: `${product ? 'Edit' : 'Create'} Product`,
								isCurrent: true,
							},
						]}
					/>

					<Button
						className='flex gap-1 justify-center items-center'
						type='submit'
						aria-disabled={isLoading}
						disabled={isLoading}
					>
						{isLoading ? (
							<Loader className='mr-2 h-4 w-4 animate-spin' />
						) : (
							<Plus className='w-4 h-auto' />
						)}
						{product ? 'Edit Product' : 'Create Product'}
					</Button>
				</div>

				<div className='grid gap-4 lg:gap-y-8 lg:gap-x-0 lg:grid-cols-1 xl:grid-cols-3 xl:gap-8 my-4'>
					<div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
						<ProductDetails form={form} isLoading={isLoading} />
						<ProductStock
							colors={colors}
							sizes={sizes}
							form={form}
							isLoading={isLoading}
						/>
						<FeaturedProduct form={form} isLoading={isLoading} />
					</div>
					<div className='grid auto-rows-max items-start gap-4 lg:gap-8'>
						<ProductCategory
							categories={categories}
							form={form}
							isLoading={isLoading}
						/>
						<ProductImages form={form} isLoading={isLoading} />
						<ProductStatus form={form} isLoading={isLoading} />
					</div>
				</div>
			</form>
		</Form>
	);
}
