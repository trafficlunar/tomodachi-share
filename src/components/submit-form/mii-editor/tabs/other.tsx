import { SwitchMiiInstructions } from "@/types";
import { useState } from "react";
import ColorPicker from "../color-picker";
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
	const [isFlipped, setIsFlipped] = useState(false);

	// One type/color state per tab
	const [colors, setColors] = useState<number[]>(Array(TABS.length).fill(0));

	const currentTab = TABS[tab];

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
				</div>

				<div className="shrink-0 w-21 pb-3 flex flex-col items-center">
					<ColorPicker color={colors[tab]} setColor={setColor} />
					<NumberInputs target={instructions.current.other[currentTab.name]} />

					{tab === 3 && (
						<div className="flex gap-1.5 items-center w-full mt-auto">
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
			</div>
		</div>
	);
}
