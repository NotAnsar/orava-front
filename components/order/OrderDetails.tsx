import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { OrderWithItems, statusEnumValues } from '@/types/db';
import { OrderFormState } from '@/actions/order-action';
import { User } from '@/types/user';

export default function OrderDetails({
	state,
	initialData,
	users,
}: {
	state: OrderFormState;
	initialData?: OrderWithItems;
	users: User[];
}) {
	return (
		<Card x-chunk='dashboard-07-chunk-0'>
			<CardHeader>
				<CardTitle>Order Details</CardTitle>
				<CardDescription>
					In this section, you can enter the total amount for the order, select
					the user associated with the order, and update the order status. Make
					sure to fill in all the required fields to ensure the order is
					processed correctly.
				</CardDescription>
			</CardHeader>
			<CardContent className='grid gap-6 sm:grid-cols-3'>
				<div className='grid gap-3 h-fit'>
					<Label
						htmlFor='total'
						className={cn(state?.errors?.total ? 'text-destructive' : '')}
					>
						Total
					</Label>
					<div>
						<Input
							id='total'
							type='number'
							name='total'
							className={cn(
								'w-full',
								state?.errors?.total
									? 'border-destructive focus-visible:ring-destructive '
									: ''
							)}
							placeholder='Total'
							step={0.01}
							defaultValue={initialData?.total || ''}
							required
						/>
						{state?.errors?.total &&
							state.errors.total.map((error: string) => (
								<p
									className='text-sm font-medium text-destructive mt-1'
									key={error}
								>
									{error}
								</p>
							))}
					</div>
				</div>
				<div className='grid gap-3 h-fit'>
					<Label
						htmlFor='status'
						className={cn(state?.errors?.status ? 'text-destructive' : '')}
					>
						Status
					</Label>
					<Select
						required
						name='status'
						defaultValue={initialData?.status ? initialData.status : ''}
					>
						<SelectTrigger id='status' aria-label='Select status' name='status'>
							<SelectValue placeholder='Select status' />
						</SelectTrigger>
						<SelectContent>
							{statusEnumValues.map((c) => (
								<SelectItem key={c} value={c}>
									{c}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{state?.errors?.status &&
						state.errors.status.map((error: string) => (
							<p
								className='text-sm font-medium text-destructive mt-1'
								key={error}
							>
								{error}
							</p>
						))}
				</div>
				<div className='grid gap-3 h-fit'>
					<Label
						htmlFor='user_id'
						className={cn(state?.errors?.user_id ? 'text-destructive' : '')}
					>
						User
					</Label>
					<Select
						required
						name='user_id'
						defaultValue={initialData?.user_id ? initialData.user_id : ''}
					>
						<SelectTrigger id='user_id' aria-label='Select User' name='user_id'>
							<SelectValue placeholder='Select User' />
						</SelectTrigger>
						<SelectContent>
							{users.map((user) => (
								<SelectItem key={user.id} value={user.id}>
									{user.firstName} {user.lastName}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{state?.errors?.user_id &&
						state.errors.user_id.map((error: string) => (
							<p className='text-sm font-medium text-destructive ' key={error}>
								{error}
							</p>
						))}
				</div>
			</CardContent>
		</Card>
	);
}
