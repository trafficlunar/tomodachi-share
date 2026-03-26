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
		<>
			<h1 className="absolute font-bold text-xl">Glasses</h1>

			<div className="size-full flex flex-col justify-center items-center">
				<ColorPicker
					color={ringColor}
					setColor={(i) => {
						setRingColor(i);
						instructions.current.glasses.ringColor = i;
					}}
					tab="glasses"
				/>
				<ColorPicker
					color={shadesColor}
					setColor={(i) => {
						setShadesColor(i);
						instructions.current.glasses.shadesColor = i;
					}}
					tab="glasses"
				/>
				<NumberInputs target={instructions.current.glasses} />
			</div>
		</>
	);
}
