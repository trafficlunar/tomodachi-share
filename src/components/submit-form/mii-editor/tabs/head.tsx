import { useState } from "react";
import ColorPicker from "../color-picker";
import { SwitchMiiInstructions } from "@/types";
import TypeSelector from "../type-selector";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

const COLORS = ["FFD8BA", "FFD5AC", "FEC1A4", "FEC68F", "FEB089", "FEBA6B", "F39866", "E89854", "E37E3F", "B45627", "914220", "59371F", "662D16", "392D1E"];

export default function HeadTab({ instructions }: Props) {
	const [color, setColor] = useState(109);
	const [type, setType] = useState(1);

	return (
		<div className="relative grow p-3 pb-0!">
			<div className="flex h-full">
				<div className="grow flex flex-col">
					<div className="flex items-center h-8">
						<h1 className="font-bold text-xl">Head</h1>
					</div>

					<div className="flex justify-center h-74 mt-auto">
						<TypeSelector
							length={16}
							type={type}
							setType={(i) => {
								setType(i);
								instructions.current.head.type = i;
							}}
						/>
					</div>
				</div>

				<div className="shrink-0 w-21 pb-3 flex flex-col items-center">
					<ColorPicker
						color={color}
						setColor={(i) => {
							setColor(i);
							instructions.current.head.skinColor = i;
						}}
					/>

					<div className="grid grid-cols-2 gap-1 w-fit mt-auto">
						{COLORS.map((hex, i) => (
							<button
								type="button"
								key={i + 108}
								onClick={() => setColor(i + 108)}
								className={`size-9 rounded-lg cursor-pointer ring-offset-2 ring-orange-500 ${color === i + 108 ? "ring-2" : ""}`}
								style={{ backgroundColor: `#${hex}` }}
							></button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
