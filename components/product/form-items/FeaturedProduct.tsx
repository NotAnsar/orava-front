'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { FormField } from '@/components/ui/form';
import { ProductForm } from '../ProductFormClient';

export default function FeaturedProduct({
	form,
	isLoading,
}: {
	form: ProductForm;
	isLoading: boolean;
}) {
	return (
		<Card x-chunk='dashboard-07-chunk-5'>
			<CardHeader>
				<CardTitle>Featured Product</CardTitle>
				<CardDescription>
					This Product Will Appear on the Home Page
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FormField
					control={form.control}
					name='featured'
					render={({ field }) => (
						<>
							<Button
								size='sm'
								variant='secondary'
								type='button'
								disabled={isLoading}
								onClick={() => field.onChange(!field.value)}
							>
								{field.value ? 'Unfeatured Product' : 'Featured Product'}
							</Button>
						</>
					)}
				/>
			</CardContent>
		</Card>
	);
}
