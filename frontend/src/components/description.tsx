import { Icon } from "@iconify/react";

interface Props {
	text: string;
	className?: string;
}

// Adds fancy formatting to links
export default function Description({ text, className }: Props) {
	const urlRegex = /(https?:\/\/[^\s]+)/g;
	const parts = text.split(urlRegex);

	return (
		<p className={`text-sm mt-2 bg-white/50 p-3 rounded-lg border border-orange-200 whitespace-break-spaces max-h-54 overflow-y-auto ${className}`}>
			{parts.map((part, index) => {
				try {
					// Check if it's a URL
					if (!urlRegex.test(part)) throw new Error("Not a URL");
					const url = new URL(part);

					return (
						<a
							key={index}
							href={`/out?url=${encodeURIComponent(part)}`}
							target="_blank"
							className="text-blue-700 underline break-all ml-1 inline-flex items-center group"
							title={`Go to ${url.hostname}`}
						>
							{url.hostname}
							{url.pathname !== "/" ? url.pathname : ""}
							{url.search}
							<Icon icon="mi:arrow-right-up" fontSize={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
						</a>
					);
				} catch {
					// Normal text/Invalid URL fallback
					return <span key={index}>{part}</span>;
				}
			})}
		</p>
	);
}
