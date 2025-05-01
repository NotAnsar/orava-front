'use client';

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Category } from '@/types/db';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { ProductForm } from '../ProductFormClient';

export default function ProductCategory({
	categories,
	form,
	isLoading,
}: {
	categories: Category[];
	form: ProductForm;
	isLoading: boolean;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Card x-chunk='dashboard-07-chunk-2'>
			<CardHeader>
				<CardTitle>Product Category</CardTitle>
			</CardHeader>
			<CardContent>
				<FormField
					control={form.control}
					name='category_id'
					render={({ field }) => (
						<FormItem className='flex flex-col'>
							<FormLabel className='text-muted-foreground'>Category</FormLabel>

							<Popover open={open} onOpenChange={setOpen}>
								<PopoverTrigger asChild disabled={isLoading}>
									<FormControl>
										<Button
											variant='outline'
											role='combobox'
											aria-expanded={open}
											className={cn('w-full justify-between')}
										>
											{field.value
												? categories.find(
														(categorie) => categorie.id === field.value
												  )?.name
												: 'Select category...'}
											<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className='popover-content-width-same-as-its-trigger p-0'>
									<Command
										filter={(value: string, search: string) => {
											const category = categories.find((c) => c.id === value);

											return category &&
												category.name
													.toLowerCase()
													.includes(search.toLowerCase())
												? 1
												: 0;
										}}
									>
										<CommandInput placeholder='Search category...' />
										<CommandEmpty>No category found.</CommandEmpty>

										<CommandGroup>
											<CommandList>
												{categories.map((categorie) => (
													<CommandItem
														key={categorie.id}
														value={categorie.id}
														onSelect={(currentValue) => {
															form.setValue(
																'category_id',
																currentValue === field.value ? '' : currentValue
															);

															setOpen(false);
														}}
													>
														<Check
															className={cn(
																'mr-2 h-4 w-4',
																field.value === categorie.name
																	? 'opacity-100'
																	: 'opacity-0'
															)}
														/>
														{categorie.name}
													</CommandItem>
												))}
											</CommandList>
										</CommandGroup>
									</Command>
								</PopoverContent>
							</Popover>
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	);
}
