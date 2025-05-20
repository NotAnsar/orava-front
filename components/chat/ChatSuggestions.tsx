import { Button } from '@/components/ui/button';

interface ChatSuggestionProps {
	onSelectSuggestion: (suggestion: string) => void;
}

export default function ChatSuggestions({
	onSelectSuggestion,
}: ChatSuggestionProps) {
	const suggestions = [
		'Show me the last 5 orders',
		'What products are out of stock?',
		'How many total products do we have?',
	];

	return (
		<div className='flex flex-wrap gap-2 mt-2'>
			{suggestions.map((suggestion) => (
				<Button
					key={suggestion}
					variant='outline'
					size='sm'
					onClick={() => onSelectSuggestion(suggestion)}
					className='text-xs'
				>
					{suggestion}
				</Button>
			))}
		</div>
	);
}
