"use client";

import { SwitchMiiInstructions } from "@/types";
import { ChangeEvent } from "react";

interface Props {
	data: SwitchMiiInstructions["voice"];
	onClick?: (e: ChangeEvent<HTMLInputElement, HTMLInputElement>, label: string) => void;
	onClickTone?: (i: number) => void;
}

const VOICE_SETTINGS: string[] = ["Speed", "Pitch", "Depth", "Delivery"];

export default function VoiceViewer({ data, onClick, onClickTone }: Props) {
	return (
		<div className="flex flex-col gap-1">
			{VOICE_SETTINGS.map((label) => (
				<div key={label} className="flex gap-3">
					<label htmlFor={label} className="text-sm w-14">
						{label}
					</label>
					<input
						type="range"
						name={label}
						className="grow"
						min={0}
						max={100}
						step={1}
						value={data[label as keyof typeof data]}
						disabled={!onClick}
						onChange={(e) => {
							if (onClick) onClick(e, label);
						}}
					/>
				</div>
			))}

			<div className="flex gap-3">
				<label htmlFor="delivery" className="text-sm w-14">
					Tone
				</label>
				<div className="grid grid-cols-6 gap-1 grow">
					{Array.from({ length: 6 }).map((_, i) => (
						<button
							type="button"
							key={i}
							onClick={() => {
								if (onClickTone) onClickTone(i);
							}}
							className={`transition-colors duration-100 rounded-xl ${data.tone === i ? "bg-orange-400!" : ""} ${onClick ? "hover:bg-orange-300 cursor-pointer" : ""}`}
						>
							{i + 1}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
