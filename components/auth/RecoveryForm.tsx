'use client';

import { useFormState } from 'react-dom';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ResetState, recoverPassword } from '@/actions/reset-password';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import PendingButton from './PendingButton';
import { useEffect } from 'react';
import { toast } from '../ui/use-toast';

export default function RecoveryForm() {
	const initialState: ResetState = { message: null, errors: {} };
	const [state, action] = useFormState(recoverPassword, initialState);

	useEffect(() => {
		if (state === undefined) {
			toast({
				title: 'Reset Link Sent',
				description:
					'Reset link successfully sent to your email. Please check your inbox.',
			});
		}
	}, [state]);

	return (
		<>
			<form className='grid gap-2' action={action}>
				<div className='space-y-2'>
					<Label className={cn(state?.errors?.email ? 'text-destructive' : '')}>
						Email
					</Label>
					<Input
						required
						type='email'
						name='email'
						placeholder='name@example.com'
						className={cn(
							'bg-transparent',
							state?.errors?.email
								? 'border-destructive focus-visible:ring-destructive '
								: ''
						)}
					/>
					{state?.errors?.email &&
						state.errors.email.map((error: string) => (
							<p className='text-sm font-medium text-destructive' key={error}>
								{error}
							</p>
						))}
				</div>

				{(state?.message || state?.errors) && (
					<p className='text-sm font-medium text-destructive'>
						{state.message}
					</p>
				)}
				<PendingButton>Send Reset Link</PendingButton>
			</form>
			<div className='grid gap-1 text-[13px] text-muted-foreground/80 '>
				<p>
					Need to sign in?{' '}
					<Link
						href={'/auth/signin'}
						className='text-foreground font-medium hover:underline'
					>
						Click here
					</Link>
				</p>
			</div>
		</>
	);
}
