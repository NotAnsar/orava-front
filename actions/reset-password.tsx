'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const resetPasswordSchema = z.object({
	email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export type ResetState =
	| {
			errors?: { email?: string[] };
			message?: string | null;
	  }
	| undefined;

// Dummy users for password reset simulation
const dummyUsers = [
	{ email: 'admin@example.com', id: '1' },
	{ email: 'user@example.com', id: '2' },
	{ email: 'customer@example.com', id: '3' },
];

export async function recoverPassword(
	prevState: ResetState,
	formData: FormData
) {
	const validatedFields = resetPasswordSchema.safeParse({
		email: formData.get('email'),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Invalid Credentials. Unable to Send Reset Link.',
		};
	}

	const { email } = validatedFields.data;

	try {
		const origin = headers().get('origin');

		// Check if user exists in our dummy data
		const userExists = dummyUsers.some((user) => user.email === email);

		if (!userExists) {
			return { message: 'User with the provided email is not found.' };
		}

		// Log instead of actually sending an email
		console.log(`Password reset link would be sent to: ${email}`);
		console.log(
			`Reset link would redirect to: ${origin}/auth/update-password?code=dummy-reset-code`
		);

		// Simulate successful password reset email
		return {
			message: 'Password reset link has been sent to your email address.',
		};
	} catch (error) {
		console.error(error);
		return { message: 'Error: Failed to Send Reset Link.' };
	}
}

const updatePasswordSchema = z
	.object({
		password: z.string().min(8, 'Password must be at least 8 characters long.'),
		confirmPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters long.'),
	})
	.refine(
		(values) => {
			return values.password === values.confirmPassword;
		},
		{
			message: 'Passwords must match!',
			path: ['confirmPassword'],
		}
	);

export type UpdatePassState =
	| {
			errors?: { password?: string[]; confirmPassword?: string[] };
			message?: string | null;
	  }
	| undefined;

export async function updatePassword(
	code: string,
	prevState: UpdatePassState,
	formData: FormData
) {
	if (!code) redirect('/auth/password-recovery');

	const validatedFields = updatePasswordSchema.safeParse({
		password: formData.get('password'),
		confirmPassword: formData.get('confirmPassword'),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Invalid Credentials. Unable to Update Password.',
		};
	}

	const { password } = validatedFields.data;

	try {
		// Just log the password update
		console.log(
			`Password would be updated to: ${password.substring(0, 1)}${'*'.repeat(
				password.length - 1
			)}`
		);
		console.log(`Reset code used: ${code}`);

		// Simulate successful password update
	} catch (error) {
		console.error(error);
		return { message: 'Unable to reset Password. Try Again' };
	}

	redirect('/');
}
