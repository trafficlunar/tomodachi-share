import { SwitchMiiInstructions } from "@/types";
import { useState } from "react";
import ColorPicker from "../color-picker";
import TypeSelector from "../type-selector";
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

export default function OtherTab({ instructions }: Props) {
	const [tab, setTab] = useState(0);

	// One type/color state per tab
	const [types, setTypes] = useState<number[]>([5, 0, 0, 0, 0, 0, 0]);
	const [colors, setColors] = useState<number[]>(Array(TABS.length).fill(0));

	const currentTab = TABS[tab];

	const setType = (value: number) => {
		setTypes((prev) => {
			const copy = [...prev];
			copy[tab] = value;
			return copy;
		});

		instructions.current.eyes[currentTab.name].type = value;
	};

	const setColor = (value: number) => {
		setColors((prev) => {
			const copy = [...prev];
			copy[tab] = value;
			return copy;
		});

		if (!currentTab.colorsDisabled) (instructions.current.eyes[currentTab.name] as { color: number }).color = value;
	};

	return (
		<div className="relative grow p-3 pb-0!">
			<div className="flex h-full">
				<div className="grow flex flex-col">
					<div className="flex items-center h-8">
						<h1 className="absolute font-bold text-xl">Eyes</h1>

						<div className="flex justify-center grow">
							<div className="rounded-2xl bg-orange-200">
								{TABS.map((_, i) => (
									<button
										key={i}
										type="button"
										onClick={() => setTab(i)}
										className={`px-3 py-1 rounded-2xl cursor-pointer hover:bg-orange-300/50 transition-colors duration-75 ${tab === i ? "bg-orange-300!" : "orange-200"}`}
									>
										{i}
									</button>
								))}
							</div>
						</div>
					</div>

					<div className="flex justify-center h-74 mt-auto">
						<TypeSelector hasNoneOption={tab === 0} length={currentTab.length} type={types[tab]} setType={setType} />
					</div>
				</div>

				<div className="shrink-0 w-21 pb-3 flex flex-col items-center">
					<div className={`${currentTab.colorsDisabled ? "hidden" : "w-full"}`}>
						<ColorPicker color={colors[tab]} setColor={setColor} />
					</div>
					<NumberInputs target={instructions.current.eyes[currentTab.name]} />
				</div>
			</div>
		</div>
	);
}
