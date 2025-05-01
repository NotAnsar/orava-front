import { OrderWithItems, ProductALL } from '@/types/db';
import { OrderFormState } from '@/actions/order-action';
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
import { useState } from 'react';
import { Button } from '../ui/button';
import { PlusIcon, X } from 'lucide-react';

interface OrderItemState {
	product_id: string;
	quantity: number;
	unit_price: number;
}

export default function OrderItems({
	state,
	initialData,
	products,
}: {
	products: ProductALL[];
	state: OrderFormState;
	initialData?: OrderWithItems;
}) {
	const [items, setItems] = useState<OrderItemState[]>(
		initialData?.order_Items.map((i) => ({
			product_id: i.product_id,
			quantity: i.quantity,
			unit_price: i.unit_price,
		})) || [{ product_id: '', quantity: 1, unit_price: 0 }]
	);

	const addItem = () => {
		setItems([...items, { product_id: '', quantity: 1, unit_price: 0 }]);
	};

	const removeItem = (index: number) => {
		if (items.length === 1) return;
		const newItems = items.filter((_, i) => i !== index);
		setItems(newItems);
	};

	const updateItem = (
		index: number,
		field: keyof OrderItemState,
		value: string | number
	) => {
		const newItems = [...items];
		newItems[index] = {
			...newItems[index],
			[field]: typeof value === 'number' ? value : value,
		};
		setItems(newItems);
	};

	const handleProductSelect = (index: number, productId: string) => {
		const selectedProduct = products.find((p) => p.id === productId);
		updateItem(index, 'product_id', productId);
		if (selectedProduct) {
			updateItem(index, 'unit_price', selectedProduct.price);
		}
	};

	return (
		<Card x-chunk='dashboard-07-chunk-1'>
			<CardHeader>
				<div className='flex justify-between items-center'>
					<div>
						<CardTitle>Order Items</CardTitle>
						<CardDescription>
							Add products to the order with quantities and prices
						</CardDescription>
					</div>
					<Button type='button' onClick={addItem} size='sm'>
						<PlusIcon className='mr-2 h-4 w-4' />
						Add Item
					</Button>
				</div>
			</CardHeader>
			<CardContent className='grid gap-6'>
				<input type='hidden' name='order_Items' value={JSON.stringify(items)} />

				{items.map((item, index) => (
					<div key={index} className='grid grid-cols-12 gap-4 items-start'>
						<div className='col-span-5 grid gap-2'>
							<Label
								htmlFor={`product-${index}`}
								className={cn(
									state?.errors?.order_Items?.[index]?.product_id &&
										'text-destructive'
								)}
							>
								Product
							</Label>
							<Select
								value={item.product_id}
								onValueChange={(value) => handleProductSelect(index, value)}
							>
								<SelectTrigger
									className={cn(
										state?.errors?.order_Items?.[index]?.product_id &&
											'border-destructive'
									)}
								>
									<SelectValue>
										{/* Show product name if selected, otherwise show placeholder */}
										{item.product_id
											? products.find((p) => p.id === item.product_id)?.name
											: 'Select product'}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{products.map((product) => (
										<SelectItem key={product.id} value={product.id}>
											{product.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{state?.errors?.order_Items?.[index]?.product_id && (
								<p className='text-sm text-destructive'>
									{state.errors.order_Items[index]?.product_id?.join(', ')}
								</p>
							)}
						</div>

						<div className='col-span-3 grid gap-2'>
							<Label
								htmlFor={`quantity-${index}`}
								className={cn(
									state?.errors?.order_Items?.[index]?.quantity &&
										'text-destructive'
								)}
							>
								Quantity
							</Label>
							<Input
								id={`quantity-${index}`}
								type='number'
								min='1'
								value={item.quantity}
								onChange={(e) =>
									updateItem(index, 'quantity', Number(e.target.value))
								}
								className={cn(
									state?.errors?.order_Items?.[index]?.quantity &&
										'border-destructive'
								)}
							/>
							{state?.errors?.order_Items?.[index]?.quantity && (
								<p className='text-sm text-destructive'>
									{state.errors.order_Items[index]?.quantity?.join(', ')}
								</p>
							)}
						</div>

						<div className='col-span-3 grid gap-2'>
							<Label
								htmlFor={`price-${index}`}
								className={cn(
									state?.errors?.order_Items?.[index]?.unit_price &&
										'text-destructive'
								)}
							>
								Unit Price
							</Label>
							<Input
								id={`price-${index}`}
								type='number'
								step='0.01'
								value={item.unit_price}
								onChange={(e) =>
									updateItem(index, 'unit_price', Number(e.target.value))
								}
								className={cn(
									state?.errors?.order_Items?.[index]?.unit_price &&
										'border-destructive'
								)}
							/>
							{state?.errors?.order_Items?.[index]?.unit_price && (
								<p className='text-sm text-destructive'>
									{state.errors.order_Items[index]?.unit_price?.join(', ')}
								</p>
							)}
						</div>

						<div className='col-span-1 mt-auto'>
							{items.length > 1 && (
								<Button
									type='button'
									variant='ghost'
									size='icon'
									onClick={() => removeItem(index)}
								>
									<X className='h-5 w-auto aspect-square text-destructive' />
								</Button>
							)}
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
