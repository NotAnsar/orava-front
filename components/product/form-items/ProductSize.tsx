import { ProductState } from '@/actions/product-action';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { Size } from '@/types/db';
import { useState } from 'react';

export default function ProductSize({
	sizes,
	state,
	defaultValue,
}: {
	sizes: Size[];
	state: ProductState;
	defaultValue?: string;
}) {
	const [size, setsize] = useState(
		defaultValue ? defaultValue : sizes.find((s) => s.name === 'M')?.id || ''
	);

	return (
		<div className='grid gap-3 mr-auto'>
			<Label
				htmlFor='size'
				className={cn(
					'text-muted-foreground',
					state?.errors?.size_id ? 'text-destructive' : ''
				)}
			>
				Size
			</Label>
			<div>
				<input type='hidden' name='size' defaultValue={size} required />

				<ToggleGroup
					type='single'
					defaultValue={size}
					variant='outline'
					className={cn(
						'w-full',
						state?.errors?.size_id
							? 'border-destructive focus-visible:ring-destructive'
							: ''
					)}
					onValueChange={(value) => setsize(value)}
				>
					{sizes.map((size) => (
						<ToggleGroupItem key={size.id} value={size.id}>
							{size.name}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				{state?.errors?.size_id &&
					state.errors.size_id.map((error: string) => (
						<p
							className='text-sm font-medium text-destructive mt-1'
							key={error}
						>
							{error}
						</p>
					))}
			</div>
		</div>
	);
}
