'use client';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Edit, Loader, Plus } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/utils';
import { useFormState } from 'react-dom';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { CategoryState, updateCategory } from '@/actions/category-action';
import { Category } from '@/types/db';

export function EditCategory({
	open,
	setopen,
	category,
}: {
	category: Category;
	open: boolean;
	setopen: Dispatch<SetStateAction<boolean>>;
}) {
	const initialState: CategoryState = { message: null, errors: {} };
	const [state, action] = useFormState(
		updateCategory.bind(null, category.id),
		initialState
	);

	useEffect(() => {
		if (state === undefined) {
			setopen(false);
			toast({ description: 'Category data created successfully.' });
		}
	}, [state, setopen]);

	return (
		<Dialog open={open} onOpenChange={setopen}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Create Category</DialogTitle>
					<DialogDescription>
						{
							"Create a new category. Enter the category details and click save when you're done."
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
								Category Name
							</Label>
							<Input
								id='name'
								name='name'
								defaultValue={category.name}
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
			Edit Category
		</Button>
	);
}
