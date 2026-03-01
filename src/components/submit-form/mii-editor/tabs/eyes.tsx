import { SwitchMiiInstructions } from "@/types";
import { useState } from "react";
import ColorPicker from "../color-picker";
import TypeSelector from "../type-selector";
import NumberInputs from "../number-inputs";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

const TABS: { name: keyof SwitchMiiInstructions["eyes"]; length: number; colorsDisabled?: number[] }[] = [
	{ name: "eyesType", length: 50 },
	{ name: "eyelashesTop", length: 40 },
	{ name: "eyelashesBottom", length: 20 },
	{ name: "eyelidTop", length: 10 },
	{ name: "eyelidBottom", length: 5 },
	{ name: "eyeliner", length: 15 },
	{ name: "pupil", length: 3 },
];

export default function OtherTab({ instructions }: Props) {
	const [tab, setTab] = useState(0);

	// One type/color state per tab
	const [types, setTypes] = useState<number[]>(Array(TABS.length).fill(0));
	const [colors, setColors] = useState<number[]>(Array(TABS.length).fill(0));

	const currentTab = TABS[tab];

	const setType = (value: number) => {
		setTypes((prev) => {
			const copy = [...prev];
			copy[tab] = value;
			return copy;
		});

		instructions.current.eyes[currentTab.name] = value;
	};

	const setColor = (value: number) => {
		setColors((prev) => {
			const copy = [...prev];
			copy[tab] = value;
			return copy;
		});

		// TODO: check in actual game, temp
		instructions.current.eyes.color = value;
	};

	return (
		<div className="relative grow p-3 pb-0!">
			<div className="flex h-full">
				<div className="grow flex flex-col">
					<div className="flex items-center h-8">
						<h1 className="absolute font-bold text-xl">Other</h1>

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
						<TypeSelector hasNoneOption length={currentTab.length} type={types[tab]} setType={setType} />
					</div>
				</div>

				<div className="shrink-0 w-21 pb-3 flex flex-col items-center">
					<div className={`${tab !== 0 ? "hidden" : "w-full"}`}>
						<ColorPicker color={colors[tab]} setColor={setColor} />
					</div>
					<NumberInputs target={instructions.current.eyes} />
				</div>
			</div>
		</div>
	);
}
