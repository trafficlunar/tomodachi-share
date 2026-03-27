import { useState } from "react";
import { SwitchMiiInstructions } from "@/types";
import ColorPicker from "../color-picker";
import NumberInputs from "../number-inputs";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

export default function EyebrowsTab({ instructions }: Props) {
	const [color, setColor] = useState(instructions.current.eyebrows.color ?? 3);

	return (
		<>
			<h1 className="absolute font-bold text-xl">Eyebrows</h1>

			<div className="size-full flex flex-col justify-center items-center">
				<ColorPicker
					color={color}
					setColor={(i) => {
						setColor(i);
						instructions.current.eyebrows.color = i;
					}}
				/>
				<NumberInputs target={instructions.current.eyebrows} />
			</div>
		</>
	);
}
