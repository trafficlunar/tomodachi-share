import { SwitchMiiInstructions } from "@/types";
import { useState } from "react";
import ColorPicker from "../color-picker";
import TypeSelector from "../type-selector";
import NumberInputs from "../number-inputs";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

const TABS: { name: keyof SwitchMiiInstructions["other"]; length: number }[] = [
	{ name: "wrinkles1", length: 9 },
	{ name: "wrinkles2", length: 15 },
	{ name: "beard", length: 15 },
	{ name: "moustache", length: 16 },
	{ name: "goatee", length: 14 },
	{ name: "mole", length: 2 },
	{ name: "eyeShadow", length: 4 },
	{ name: "blush", length: 8 },
];

export default function OtherTab({ instructions }: Props) {
	const [tab, setTab] = useState(0);

	// One type/color state per tab
	const [types, setTypes] = useState<number[]>(Array(TABS.length).fill(0));
	const [colors, setColors] = useState<number[]>(Array(TABS.length).fill(0));

	const currentTab = TABS[tab];
	const isColorPickerDisabled = currentTab.colorsDisabled ? currentTab.colorsDisabled.includes(types[tab]) : false;

	const setType = (value: number) => {
		setTypes((prev) => {
			const copy = [...prev];
			copy[tab] = value;
			return copy;
		});

		instructions.current.other[currentTab.name].type = value;
	};

	const setColor = (value: number) => {
		setColors((prev) => {
			const copy = [...prev];
			copy[tab] = value;
			return copy;
		});

		instructions.current.other[currentTab.name].color = value;
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
						<TypeSelector length={currentTab.length} type={types[tab]} setType={setType} />
					</div>
				</div>

				<div className="shrink-0 w-21 pb-3 flex flex-col items-center">
					<ColorPicker disabled={isColorPickerDisabled} color={colors[tab]} setColor={setColor} />
					<NumberInputs target={instructions.current.other[currentTab.name]} />
				</div>
			</div>
		</div>
	);
}
