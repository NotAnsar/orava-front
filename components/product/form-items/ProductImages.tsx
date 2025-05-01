'use client';

import { buttonVariants } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { ProductForm } from '../ProductFormClient';
import { useMemo } from 'react';

// export default function ProductImages({
// 	form,
// 	isLoading,
// }: {
// 	form: ProductForm;
// 	isLoading: boolean;
// }) {
// 	return (
// 		<Card className='overflow-hidden' x-chunk='dashboard-07-chunk-4'>
// 			<CardHeader>
// 				<CardTitle>Product Images</CardTitle>
// 				<CardDescription>
// 					Upload and manage your product images here.
// 					<br />
// 					Minimum 1 image, maximum 4 images.
// 				</CardDescription>
// 			</CardHeader>
// 			<CardContent>
// 				<FormField
// 					control={form.control}
// 					name='images'
// 					render={({ field, fieldState }) => {
// 						return (
// 							<FormItem className='grid gap-1 '>
// 								<FormControl>
// 									<>
// 										<div className={cn('grid gap-2 mb-2 grid-cols-2')}>
// 											{field.value.map(
// 												(image, i) =>
// 													image && (
// 														<ProductImage
// 															src={image}
// 															key={i}
// 															errorMessage={
// 																Array.isArray(fieldState.error)
// 																	? (fieldState.error[i] as FieldError)
// 																	: undefined
// 															}
// 															remove={(imgToRmv) => {
// 																field.onChange(
// 																	field.value.filter(
// 																		(file) => file !== imgToRmv
// 																	)
// 																);
// 															}}
// 														/>
// 													)
// 											)}
// 										</div>

// 										<div className={cn('grid grid-cols-1 gap-2')}>
// 											<label
// 												className={cn(
// 													buttonVariants({ variant: 'ghost' }),
// 													'flex h-12 w-full items-center justify-center rounded-md border border-dashed hover:cursor-pointer relative'
// 												)}
// 												htmlFor='images'
// 											>
// 												<Upload className='h-auto w-4 aspect-square text-muted-foreground' />
// 												<span className='sr-only'>Upload</span>
// 												<Input
// 													type='file'
// 													accept='.jpg,.jpeg,.png'
// 													id='images'
// 													readOnly
// 													multiple
// 													max='4'
// 													min='1'
// 													required
// 													className='sr-only'
// 													disabled={isLoading}
// 													onChange={(e) => {
// 														if (e.target.files) {
// 															const newImages = Array.from(e.target.files);

// 															const totalImages =
// 																field.value.length + newImages.length;
// 															if (totalImages > 4) {
// 																toast({
// 																	title: 'Maximum number of images',
// 																	description:
// 																		'You can only upload a maximum of 4 images.',
// 																});

// 																return;
// 															}

// 															field.onChange([...field.value, ...newImages]);
// 														}
// 													}}
// 												/>
// 											</label>
// 										</div>
// 									</>
// 								</FormControl>

// 								{fieldState.error && (
// 									<p className='text-sm text-destructive'>
// 										1-4 images required. Each must be PNG/JPEG/JPG, max 4 MB.
// 									</p>
// 								)}
// 							</FormItem>
// 						);
// 					}}
// 				/>
// 			</CardContent>
// 		</Card>
// 	);
// }

// export function validateFileType(files: FileList): boolean {
// 	const validTypes = ['image/png', 'image/jpeg'];
// 	return Array.from(files).every((file) => validTypes.includes(file.type));
// }

export default function ProductImages({
	form,
	isLoading,
}: {
	form: ProductForm;
	isLoading: boolean;
}) {
	return (
		<Card className='overflow-hidden'>
			<CardHeader>
				<CardTitle>Product Images</CardTitle>
				<CardDescription>
					Upload and manage your product images here.
					<br />
					Minimum 1 image, maximum 4 images.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FormField
					control={form.control}
					name='images'
					render={({ field, fieldState }) => {
						return (
							<FormItem className='grid gap-1 '>
								<FormControl>
									<>
										<div className={cn('grid gap-2 mb-2 grid-cols-2')}>
											{field.value.map((image, i) => (
												<ProductImage
													src={image}
													key={i}
													remove={() => {
														const updatedImages = field.value.filter(
															(_, index) => index !== i
														);
														form.setValue('images', updatedImages);
													}}
												/>
											))}
										</div>

										<div className={cn('grid grid-cols-1 gap-2')}>
											<label
												className={cn(
													buttonVariants({ variant: 'ghost' }),
													'flex h-12 w-full items-center justify-center rounded-md border border-dashed hover:cursor-pointer relative'
												)}
												htmlFor='images'
											>
												<Upload className='h-auto w-4 aspect-square text-muted-foreground' />
												<span className='sr-only'>Upload</span>
												<Input
													type='file'
													accept='.jpg,.jpeg,.png'
													id='images'
													readOnly
													multiple
													max='4'
													min='1'
													required
													className='sr-only'
													disabled={isLoading}
													onChange={(e) => {
														if (e.target.files) {
															const newImages = Array.from(e.target.files);
															const totalImages =
																field.value.length + newImages.length;

															if (totalImages > 4) {
																toast({
																	title: 'Maximum number of images',
																	description:
																		'You can only upload a maximum of 4 images.',
																});
																return;
															}

															form.setValue('images', [
																...field.value,
																...newImages,
															]);
														}
													}}
												/>
											</label>
										</div>
									</>
								</FormControl>

								{fieldState.error && (
									<p className='text-sm text-destructive'>
										1-4 images required. Each must be PNG/JPEG/JPG, max 1 MB per
										Image.
									</p>
								)}
							</FormItem>
						);
					}}
				/>
			</CardContent>
		</Card>
	);
}

export function ProductImage({
	src,
	remove,
}: {
	src: string | File;
	remove: () => void;
}) {
	const imageUrl = useMemo(
		() => (typeof src === 'string' ? src : URL.createObjectURL(src)),
		[src]
	);

	return (
		<div className='grid gap-2'>
			<div className='relative group rounded-md border border-border overflow-hidden'>
				<Image
					src={imageUrl}
					alt=''
					width={700}
					height={700}
					className='w-full h-auto aspect-square object-cover'
				/>
				<span
					className='w-full h-full aspect-square place-items-center bg-secondary/90 hidden cursor-pointer group-hover:grid absolute inset-0'
					onClick={remove}
				>
					<Trash2 className='w-3/12 h-auto text-destructive' />
				</span>
			</div>
		</div>
	);
}
