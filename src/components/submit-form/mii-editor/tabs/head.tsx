import { useState } from "react";
import ColorPicker from "../color-picker";
import { SwitchMiiInstructions } from "@/types";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

const COLORS = ["FFD8BA", "FFD5AC", "FEC1A4", "FEC68F", "FEB089", "FEBA6B", "F39866", "E89854", "E37E3F", "B45627", "914220", "59371F", "662D16", "392D1E"];

export default function HeadTab({ instructions }: Props) {
	const [color, setColor] = useState(instructions.current.head.skinColor ?? 109);

	return (
		<>
			<h1 className="absolute font-bold text-xl">Head</h1>

			<div className="size-full flex flex-col justify-center items-center">
				<ColorPicker
					color={color}
					setColor={(i) => {
						setColor(i);
						instructions.current.head.skinColor = i;
					}}
				/>

				<div className="grid grid-cols-7 gap-1">
					{COLORS.map((hex, i) => (
						<button
							type="button"
							key={i + 108}
							onClick={() => {
								setColor(i + 108);
								instructions.current.head.skinColor = i + 108;
							}}
							className={`size-9 rounded-lg cursor-pointer ring-offset-2 ring-orange-500 ${color === i + 108 ? "ring-2" : ""}`}
							style={{ backgroundColor: `#${hex}` }}
						></button>
					))}
				</div>
			</div>
		</>
	);
}
