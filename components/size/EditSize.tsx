'use client';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { Edit, Loader } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/utils';
import { useFormState } from 'react-dom';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { SizeState, updateSize } from '@/actions/size-action';
import { Size } from '@/types/db';

export function EditSize({
	open,
	setopen,
	size,
}: {
	size: Size;
	open: boolean;
	setopen: Dispatch<SetStateAction<boolean>>;
}) {
	const initialState: SizeState = { message: null, errors: {} };
	const [state, action] = useFormState(
		updateSize.bind(null, size.id),
		initialState
	);

	useEffect(() => {
		if (state === undefined) {
			setopen(false);
			toast({ description: 'Size data updated successfully.' });
		}
	}, [state, setopen]);

	return (
		<Dialog open={open} onOpenChange={setopen}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Edit Size</DialogTitle>
					<DialogDescription>
						{
							"Update a Size Enter the size details below and click 'Save' when you're done."
						}
					</DialogDescription>
				</DialogHeader>

				<form className='grid gap-4 ' id='update' action={action}>
					<div>
						<div className='flex items-center gap-4'>
							<Label
								htmlFor='fname'
								className={cn(
									'text-nowrap',
									state?.errors?.name ? 'text-destructive' : ''
								)}
							>
								Size Name
							</Label>
							<Input
								id='name'
								name='name'
								defaultValue={size.name}
								className={cn(
									'bg-transparent col-span-3',
									state?.errors?.name
										? 'border-destructive focus-visible:ring-destructive '
										: ''
								)}
							/>
						</div>
						{state?.errors?.name &&
							state.errors.name.map((error: string) => (
								<p
									className='text-sm font-medium text-destructive col-span-full mt-2'
									key={error}
								>
									{error}
								</p>
							))}
					</div>
					<div>
						<div className='flex items-center gap-4'>
							<Label
								htmlFor='fullname'
								className={cn(
									'text-nowrap',
									state?.errors?.fullname ? 'text-destructive' : ''
								)}
							>
								Size Fullname
							</Label>
							<Input
								id='fullname'
								name='fullname'
								defaultValue={size?.fullname || undefined}
								className={cn(
									'bg-transparent col-span-3',
									state?.errors?.fullname
										? 'border-destructive focus-visible:ring-destructive '
										: ''
								)}
							/>
						</div>
						{state?.errors?.fullname &&
							state.errors.fullname.map((error: string) => (
								<p
									className='text-sm font-medium text-destructive col-span-full mt-2'
									key={error}
								>
									{error}
								</p>
							))}
					</div>

					<DialogFooter>
						{(state?.message || state?.errors) && (
							<p className='text-sm font-medium text-destructive mr-auto'>
								{state.message}
							</p>
						)}
						<PendingButton />
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function PendingButton() {
	const { pending } = useFormStatus();

	return (
		<Button type='submit' aria-disabled={pending} disabled={pending}>
			{pending ? (
				<Loader className='mr-2 h-4 w-4 animate-spin' />
			) : (
				<Edit className='mr-2 h-4 w-4' />
			)}
			Edit Size
		</Button>
	);
}
