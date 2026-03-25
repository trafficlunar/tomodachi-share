import { useState } from "react";
import { SwitchMiiInstructions } from "@/types";
import ColorPicker from "../color-picker";
import NumberInputs from "../number-inputs";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

export default function GlassesTab({ instructions }: Props) {
	const [ringColor, setRingColor] = useState(0);
	const [shadesColor, setShadesColor] = useState(0);

	return (
		<div className="relative grow p-3 pb-0!">
			<div className="flex h-full">
				<div className="grow flex flex-col">
					<div className="flex items-center h-8">
						<h1 className="font-bold text-xl">Glasses</h1>
					</div>
				</div>

				<div className="shrink-0 w-21 pb-3 flex flex-col items-center">
					<ColorPicker
						color={ringColor}
						setColor={(i) => {
							setRingColor(i);
							instructions.current.glasses.ringColor = i;
						}}
					/>
					<ColorPicker
						color={shadesColor}
						setColor={(i) => {
							setShadesColor(i);
							instructions.current.glasses.shadesColor = i;
						}}
					/>
					<NumberInputs target={instructions.current.glasses} />
				</div>
			</div>
		</div>
	);
}
