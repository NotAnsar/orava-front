import { Input } from '../../ui/input';
import { RotateCcw } from 'lucide-react';
import { Button } from '../../ui/button';
import { Table } from '@tanstack/react-table';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { statusEnumValues } from '@/types/db';

export default function FilterTable<TData>({ table }: { table: Table<TData> }) {
	return (
		<div className='flex flex-col sm:flex-row items-center py-4 gap-2 justify-between'>
			<Input
				placeholder='Filter by User Name'
				className='flex gap-1 w-full lg:w-[270px] '
				value={(table.getColumn('user_name')?.getFilterValue() as string) ?? ''}
				onChange={(event) =>
					table.getColumn('user_name')?.setFilterValue(event.target.value)
				}
			/>

			<div className='flex items-center gap-2 w-full lg:w-[225px] text-sm'>
				<Select
					onValueChange={(e) => table.getColumn('status')?.setFilterValue(e)}
					value={(table.getColumn('status')?.getFilterValue() as string) || ''}
				>
					<SelectTrigger className='order-none md:order-1 text-sm'>
						<SelectValue placeholder='Filter by Status' />
					</SelectTrigger>
					<SelectContent className='w-full text-sm'>
						{statusEnumValues.map((c) => (
							<SelectItem key={c} value={c}>
								{c}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{table.getColumn('status')?.getIsFiltered() && (
					<Button
						variant={'outline'}
						onClick={() => table.getColumn('status')?.setFilterValue('')}
						className=' flex items-center gap-2 '
					>
						<RotateCcw className={'h-[13px] w-[13px] mt-[2px] '} />
					</Button>
				)}
			</div>
		</div>
	);
}
