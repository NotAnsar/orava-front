import { z } from 'zod';

export const productSchema = z.object({
	name: z
		.string()
		.min(3, { message: 'Product Name must be at least 3 characters long.' }),
	description: z.string(),
	price: z.coerce
		.number()
		.positive({ message: 'Price must be a positive number' }),
	stock: z.coerce
		.number()
		.int()
		.min(0, { message: 'Stock must be a non-negative integer' }),
	color_id: z.string({ message: 'Please provide a valid color identifier.' }),
	size_id: z.string({ message: 'Please provide a valid size identifier.' }),
	featured: z.boolean(),
	category_id: z.string({
		message: 'Please provide a valid category identifier.',
	}),
	archived: z.boolean(),
	// images: z
	// 	.array(
	// 		z.instanceof(File).refine(
	// 			(file) => {
	// 				return (
	// 					file.size <= 4 * 1024 * 1024 &&
	// 					['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)
	// 				);
	// 			},
	// 			{
	// 				message: '1-4 images required. Each must be PNG/JPEG/JPG, max 4 MB.',
	// 			}
	// 		)
	// 	)
	// 	.min(1, { message: 'At least one product image is required' })
	// 	.max(4, { message: 'Maximum of 4 product images allowed' })
	// 	.refine(
	// 		(files) =>
	// 			files.every(
	// 				(file) =>
	// 					file.size <= 4 * 1024 * 1024 &&
	// 					['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)
	// 			),
	// 		{
	// 			message:
	// 				'All images must be PNG, JPEG, or JPG format and not exceed 4 MB in size. Please ensure all selected files meet these criteria.',
	// 		}
	// 	),
	images: z
		.array(
			z.union([
				z.string().url(),
				z.instanceof(File).refine(
					(file) => {
						return (
							file.size <= 4 * 1024 * 1024 &&
							['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)
						);
					},
					{
						message: 'Each file must be PNG/JPEG/JPG and not exceed 4MB',
					}
				),
			])
		)
		.min(1, { message: 'At least one product image is required' })
		.max(4, { message: 'Maximum of 4 product images allowed' })
		.refine(
			(files) =>
				files.every((file) =>
					typeof file === 'string'
						? true // Assume existing URLs are valid
						: file.size <= 1 * 1024 * 1024 &&
						  ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)
				),
			{
				message:
					'All images must be PNG, JPEG, or JPG format and not exceed 4 MB in size. Please ensure all selected files meet these criteria.',
			}
		),
});

// You can also export the inferred type if needed
export type ProductSchemaType = z.infer<typeof productSchema>;
