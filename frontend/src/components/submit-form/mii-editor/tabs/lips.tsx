import { type SwitchMiiInstructions } from "@tomodachi-share/shared";
import ColorPicker from "../color-picker";
import NumberInputs from "../number-inputs";
import { useState } from "react";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

export default function LipsTab({ instructions }: Props) {
	const [color, setColor] = useState(instructions.current.lips.color ?? 128);
	const [hasLipstick, setHasLipstick] = useState(instructions.current.lips.hasLipstick);

	return (
		<>
			<h1 className="absolute font-bold text-xl">Lips</h1>

			<div className="size-full flex flex-col justify-center items-center">
				<ColorPicker
					color={color}
					setColor={(i) => {
						setColor(i);
						instructions.current.lips.color = i;
					}}
					tab="lips"
				/>
				<NumberInputs target={instructions.current.lips} />

				<div className="flex gap-1.5 items-center mt-4">
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
		</>
	);
}
