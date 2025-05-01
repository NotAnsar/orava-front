import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Color, Size } from '@/types/db';
import { ProductForm } from '../ProductFormClient';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';

export default function ProductStock({
	colors,
	sizes,
	form,
	isLoading,
}: {
	isLoading: boolean;
	form: ProductForm;
	colors: Color[];
	sizes: Size[];
}) {
	return (
		<Card x-chunk='dashboard-07-chunk-1'>
			<CardHeader>
				<CardTitle>Stock</CardTitle>
				<CardDescription>
					Lipsum dolor sit amet, consectetur adipiscing elit
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:flex gap-6 justify-between'>
					<FormField
						control={form.control}
						name='stock'
						render={({ field }) => (
							<FormItem className='grid gap-1'>
								<FormLabel>Stock</FormLabel>
								<FormControl>
									<Input
										{...field}
										type='number'
										className='bg-transparent'
										disabled={isLoading}
										min={0}
										required
										value={field.value ?? ''}
									/>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='price'
						render={({ field }) => (
							<FormItem className='grid gap-1'>
								<FormLabel>Price</FormLabel>
								<FormControl>
									<Input
										{...field}
										type='number'
										className='bg-transparent'
										disabled={isLoading}
										min={0.01}
										required
										step='any'
										value={field.value ?? ''}
									/>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='color_id'
						render={({ field }) => (
							<FormItem className='grid gap-1 lg:w-[180px]'>
								<FormLabel>Color</FormLabel>
								<FormControl>
									<Select
										required
										onValueChange={field.onChange}
										defaultValue={field.value}
										disabled={isLoading}
									>
										<SelectTrigger
											id='color'
											aria-label='Select Color'
											aria-required
										>
											<SelectValue placeholder='Select Color' />
										</SelectTrigger>
										<SelectContent>
											{colors.map((color) => (
												<SelectItem key={color.id} value={color.id}>
													{color.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='size_id'
						render={({ field }) => (
							<FormItem className='grid gap-1 mr-auto'>
								<FormLabel>Size</FormLabel>

								<ToggleGroup
									type='single'
									variant='outline'
									className='w-full'
									onValueChange={field.onChange}
									defaultValue={field.value}
									disabled={isLoading}
								>
									{sizes.map((size) => (
										<ToggleGroupItem key={size.id} value={size.id}>
											{size.name}
										</ToggleGroupItem>
									))}
								</ToggleGroup>

								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
