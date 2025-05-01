import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

import { ProductForm } from '../ProductFormClient';
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';

export default function ProductStatus({
	form,
	isLoading,
}: {
	form: ProductForm;
	isLoading: boolean;
}) {
	return (
		<Card x-chunk='dashboard-07-chunk-3'>
			<CardHeader>
				<CardTitle>Product Status</CardTitle>
			</CardHeader>
			<CardContent>
				<FormField
					control={form.control}
					name='archived'
					render={({ field }) => (
						<FormItem className='grid gap-1 '>
							<FormLabel>Status</FormLabel>
							<FormControl>
								<Select
									required
									onValueChange={(value) =>
										field.onChange(value === 'archived')
									}
									value={field.value ? 'archived' : 'active'}
									disabled={isLoading}
								>
									<SelectTrigger
										id='color'
										aria-label='Select Color'
										aria-required
									>
										<SelectValue placeholder='Select status' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='active'>Active</SelectItem>
										<SelectItem value='archived'>Archived</SelectItem>
									</SelectContent>
								</Select>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	);
}
