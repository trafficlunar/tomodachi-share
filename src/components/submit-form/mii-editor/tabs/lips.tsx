import { SwitchMiiInstructions } from "@/types";
import ColorPicker from "../color-picker";
import NumberInputs from "../number-inputs";
import { useState } from "react";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

export default function LipsTab({ instructions }: Props) {
	const [color, setColor] = useState(0);
	const [hasLipstick, setHasLipstick] = useState(false);

	return (
		<div className="relative grow p-3 pb-0!">
			<div className="flex h-full">
				<div className="grow flex flex-col">
					<div className="flex items-center h-8">
						<h1 className="font-bold text-xl">Lips</h1>
					</div>
				</div>

				<div className="shrink-0 w-21 pb-3 flex flex-col items-center">
					<ColorPicker
						color={color}
						setColor={(i) => {
							setColor(i);
							instructions.current.lips.color = i;
						}}
					/>
					<NumberInputs target={instructions.current.lips} />

					<div className="flex gap-1.5 items-center w-full mt-auto">
						<input
							type="checkbox"
							id="subcolor"
							className="checkbox"
							checked={hasLipstick}
							onChange={(e) => {
								setHasLipstick(e.target.checked);
								instructions.current.lips.hasLipstick = e.target.checked;
							}}
						/>
						<label htmlFor="subcolor" className="text-xs">
							Lipstick
						</label>
					</div>
				</div>
			</div>
		</div>
	);
}
