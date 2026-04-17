import { useState } from "react";
import { Icon } from "@iconify/react";

interface Props {
	onClick: () => void | Promise<void>;
	disabled?: boolean;
	text?: string;
	className?: string;
}

export default function SubmitButton({ onClick, disabled = false, text = "Submit", className }: Props) {
	const [isLoading, setIsLoading] = useState(false);

	const handleClick = async (event: React.FormEvent) => {
		event.preventDefault();

		setIsLoading(true);
		try {
			await onClick();
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button type="submit" aria-label={text} onClick={handleClick} disabled={disabled} className={`pill button w-min ${className}`}>
			{text}
			{isLoading && <Icon icon="svg-spinners:180-ring-with-bg" className="ml-2" />}
		</button>
	);
}
