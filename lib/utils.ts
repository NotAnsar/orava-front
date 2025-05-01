import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatTimestamp(timestamp: string, showTime: boolean = false): string {
	const dateObj = new Date(timestamp);

	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];

	let formattedDate = `
	${dateObj.getDate().toString().padStart(2, '0')} ${
		months[dateObj.getMonth()]
	} ${dateObj.getFullYear()}
	`;

	if (showTime) {
		const hours = dateObj.getHours().toString().padStart(2, '0');
		const minutes = dateObj.getMinutes().toString().padStart(2, '0');
		formattedDate += ` ${hours}:${minutes}`;
	}

	return formattedDate;
}
