"use client";
import { SwitchMiiInstructions } from "@/types";
import EnhancedSlider from "@/components/submit-form/mii-editor/enhanced-slider";

interface Props {
	data: SwitchMiiInstructions["voice"];
	onChange: (value: number, label: string) => void;
	onClickTone: (i: number) => void;
}

const VOICE_SETTINGS = ["Speed", "Pitch", "Depth", "Delivery"];

export default function VoiceViewer({ data, onChange, onClickTone }: Props) {
	return (
		<div className="flex flex-col">
			{VOICE_SETTINGS.map((label) => {
				const value = data[label.toLowerCase() as keyof typeof data] ?? 25;
				return <EnhancedSlider key={label} label={label} value={value} onChange={(v) => onChange?.(v, label.toLowerCase())} min={0} max={50} mid={25} />;
			})}

			<div className="flex gap-3 mt-2">
				<label htmlFor="delivery" className="text-sm w-14">
					Tone
				</label>
				<div className="grid grid-cols-6 gap-1 min-w-50">
					{Array.from({ length: 6 }).map((_, i) => (
						<button
							type="button"
							key={i}
							onClick={() => {
								if (onClickTone) onClickTone(i + 1);
							}}
							className={`transition-colors duration-100 rounded-xl hover:bg-orange-300 cursor-pointer ${data.tone === i + 1 ? "bg-orange-400!" : ""}`}
						>
							{i + 1}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
