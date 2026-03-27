import { SwitchMiiInstructions } from "@/types";
import { useState } from "react";
import ColorPicker from "../color-picker";
import NumberInputs from "../number-inputs";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

const TABS: { name: keyof SwitchMiiInstructions["other"]; length: number; defaultColor?: number }[] = [
	{ name: "wrinkles1", length: 9 },
	{ name: "wrinkles2", length: 15 },
	{ name: "beard", length: 15 },
	{ name: "moustache", length: 16 },
	{ name: "goatee", length: 14 },
	{ name: "mole", length: 2 },
	{ name: "eyeShadow", length: 4, defaultColor: 139 },
	{ name: "blush", length: 8 },
];

export default function OtherTab({ instructions }: Props) {
	const [tab, setTab] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);

	const [colors, setColors] = useState<number[]>(() =>
		TABS.map((t) => {
			const entry = instructions.current.other[t.name] ?? {};
			const color = entry && "color" in entry ? entry.color : null;
			return color ?? t.defaultColor ?? 0;
		}),
	);

	const currentTab = TABS[tab];

	const setColor = (value: number) => {
		setColors((prev) => {
			const copy = [...prev];
			copy[tab] = value;
			return copy;
		});

		const target = instructions.current.other[currentTab.name];
		if ("color" in target) {
			target.color = value;
		}
	};

	return (
		<>
			<h1 className="absolute font-bold text-xl">Other</h1>

			<div className="absolute right-3 z-10 flex justify-end">
				<div className="rounded-2xl bg-orange-200">
					{TABS.map((_, i) => (
						<button
							key={i}
							type="button"
							onClick={() => setTab(i)}
							className={`px-3 py-1 rounded-2xl cursor-pointer hover:bg-orange-300/50 transition-colors duration-75 ${tab === i ? "bg-orange-300!" : "orange-200"}`}
						>
							{i + 1}
						</button>
					))}
				</div>
			</div>

			<div className="absolute inset-0 flex flex-col justify-center items-center">
				<ColorPicker disabled={tab === 0 || tab === 1} color={colors[tab]} setColor={setColor} tab={tab === 6 ? "eyeliner" : "hair"} />
				<NumberInputs target={instructions.current.other[currentTab.name]} />

				{tab === 3 && (
					<div className="flex gap-1.5 items-center mt-4">
						<input
							type="checkbox"
							id="subcolor"
							className="checkbox"
							checked={isFlipped}
							onChange={(e) => {
								setIsFlipped(e.target.checked);
								instructions.current.other.moustache.isFlipped = e.target.checked;
							}}
						/>
						<label htmlFor="subcolor" className="text-xs">
							Flip
						</label>
					</div>
				)}
			</div>
		</>
	);
}
