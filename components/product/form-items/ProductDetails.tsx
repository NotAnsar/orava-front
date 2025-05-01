import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProductALL } from '@/types/db';
import { ProductForm } from '../ProductFormClient';

export default function ProductDetails({
	isLoading,
	form,
}: {
	product?: ProductALL;
	isLoading: boolean;
	form: ProductForm;
}) {
	return (
		<Card x-chunk='dashboard-07-chunk-0'>
			<CardHeader>
				<CardTitle>Product Details</CardTitle>
				<CardDescription>
					Your new text here
				This section allows you to provide detailed information about the product. You can add the product name and a description to give more context.
				</CardDescription>
			</CardHeader>
			<CardContent className='grid gap-6'>
				<FormField
					control={form.control}
					name='name'
					render={({ field }) => (
						<FormItem className='grid gap-1'>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input
									type='text'
									placeholder='Product Name'
									className='bg-transparent'
									disabled={isLoading}
									{...field}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='description'
					render={({ field }) => (
						<FormItem className='grid gap-1'>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea
									id='description'
									placeholder='Product Description'
									className='min-h-32'
									disabled={isLoading}
									{...field}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	);
}
