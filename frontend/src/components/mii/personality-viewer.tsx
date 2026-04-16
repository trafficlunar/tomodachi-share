import { type SwitchMiiInstructions } from "@tomodachi-share/shared";

interface Props {
	data: SwitchMiiInstructions["personality"];
	onClick?: (key: string, i: number) => void;
}

const PERSONALITY_SETTINGS: { label: string; left: string; right: string }[] = [
	{ label: "Movement", left: "Slow", right: "Quick" },
	{ label: "Speech", left: "Polite", right: "Honest" },
	{ label: "Energy", left: "Flat", right: "Varied" },
	{ label: "Thinking", left: "Serious", right: "Chill" },
	{ label: "Overall", left: "Normal", right: "Quirky" },
];

export default function PersonalityViewer({ data, onClick }: Props) {
	return (
		<div className="flex flex-col gap-1.5 mb-3">
			{PERSONALITY_SETTINGS.map(({ label, left, right }) => {
				const key = label.toLowerCase() as keyof typeof data;
				return (
					<div key={label} className="flex justify-center items-center gap-2">
						<span className="text-sm w-24 shrink-0">{label}</span>
						<span className="text-sm text-zinc-500 w-14 text-right">{left}</span>
						<div className="flex gap-0.5">
							{Array.from({ length: 8 }).map((_, i) => {
								const colors = [
									"bg-green-400",
									"bg-green-300",
									"bg-emerald-200",
									"bg-teal-200",
									"bg-orange-200",
									"bg-orange-300",
									"bg-orange-400",
									"bg-orange-500",
								];
								return (
									<button
										key={i}
										type="button"
										onClick={() => {
											if (onClick) onClick(key, i);
										}}
										className={`size-7 rounded-lg transition-opacity duration-100 border-black/40
                  ${colors[i]} ${data[key] === i ? "border-2 opacity-100" : "opacity-70"} ${onClick ? "cursor-pointer" : ""}`}
									></button>
								);
							})}
						</div>
						<span className="text-sm text-zinc-500 w-12 shrink-0">{right}</span>
					</div>
				);
			})}
		</div>
	);
}
