import { SwitchMiiInstructions } from "@/types";
import { useState } from "react";
import ColorPicker from "../color-picker";
import NumberInputs from "../number-inputs";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

const TABS: { name: keyof SwitchMiiInstructions["eyes"]; length: number; colorsDisabled?: boolean }[] = [
	{ name: "main", length: 76 },
	{ name: "eyelashesTop", length: 6, colorsDisabled: true },
	{ name: "eyelashesBottom", length: 2, colorsDisabled: true },
	{ name: "eyelidTop", length: 3, colorsDisabled: true },
	{ name: "eyelidBottom", length: 3, colorsDisabled: true },
	{ name: "eyeliner", length: 2 },
	{ name: "pupil", length: 10, colorsDisabled: true },
];

export default function EyesTab({ instructions }: Props) {
	const [tab, setTab] = useState(0);
	const [colors, setColors] = useState<number[]>(() =>
		TABS.map((t) => {
			const entry = instructions.current.eyes[t.name];
			const color = "color" in entry ? entry.color : null;
			return color ?? 122;
		}),
	);

	const currentTab = TABS[tab];

	const setColor = (value: number) => {
		setColors((prev) => {
			const copy = [...prev];
			copy[tab] = value;
			return copy;
		});

		if (!currentTab.colorsDisabled) (instructions.current.eyes[currentTab.name] as { color: number }).color = value;
	};

	return (
		<>
			<h1 className="absolute font-bold text-xl">Eyes</h1>

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
				<ColorPicker disabled={currentTab.colorsDisabled} color={colors[tab]} setColor={setColor} tab={tab === 5 ? "eyeliner" : "eyes"} />
				<NumberInputs target={instructions.current.eyes[currentTab.name]} />
			</div>
		</>
	);
}
