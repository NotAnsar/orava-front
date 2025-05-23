import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

const recoleta = localFont({
	src: [{ path: '../public/fonts/recoleta-regular.otf', weight: '400' }],
	variable: '--font-serif',
});

const fontSans = localFont({
	src: [
		{ path: '../public/fonts/satoshi/Satoshi-Light.otf', weight: '300' },
		{ path: '../public/fonts/satoshi/Satoshi-Regular.otf', weight: '400' },
		{ path: '../public/fonts/satoshi/Satoshi-Medium.otf', weight: '500' },
		{ path: '../public/fonts/satoshi/Satoshi-Bold.otf', weight: '600' },
		{ path: '../public/fonts/satoshi/Satoshi-Black.otf', weight: '700' },
	],
	variable: '--font-sans',
});

export const metadata: Metadata = {
	title: 'Create Next App',
	description: 'Generated by create next app',
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' className='antialiased' suppressHydrationWarning>
			<body
				className={cn(
					'min-h-screen bg-background font-sans antialiased',
					fontSans.variable,
					recoleta.variable
				)}
			>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange
				>
					{children}

					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
