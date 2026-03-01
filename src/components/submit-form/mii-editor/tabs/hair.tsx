import { SwitchMiiInstructions } from "@/types";
import { useState } from "react";
import ColorPicker from "../color-picker";
import TypeSelector from "../type-selector";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

type Tab = "sets" | "bangs" | "back";

export default function HairTab({ instructions }: Props) {
	const [tab, setTab] = useState<Tab>("sets");
	const [setsType, setSetsType] = useState(0);
	const [bangsType, setBangsType] = useState(0);
	const [backType, setBackType] = useState(0);
	const [color, setColor] = useState(0);
	const [subColor, setSubColor] = useState<number | null>(null);
	const [isFlipped, setIsFlipped] = useState(false);

	const type = tab === "sets" ? setsType : tab === "bangs" ? bangsType : backType;
	const setType = (value: number) => {
		if (tab === "sets") {
			setSetsType(value);
			instructions.current.hair.setType = value;
		} else if (tab === "bangs") {
			setBangsType(value);
			instructions.current.hair.bangsType = value;
		} else {
			setBackType(value);
			instructions.current.hair.backType = value;
		}
	};

	return (
		<div className="relative grow p-3 pb-0!">
			<div className="flex h-full">
				<div className="grow flex flex-col">
					<div className="flex items-center h-8">
						<h1 className="absolute font-bold text-xl">Hair</h1>

						<div className="flex justify-center grow">
							<button
								type="button"
								onClick={() => setTab("sets")}
								className={`px-3 py-1 rounded-2xl bg-orange-200 mr-1 cursor-pointer hover:bg-orange-300/50 transition-colors duration-75 ${tab === "sets" ? "bg-orange-300!" : "orange-200"}`}
							>
								Sets
							</button>

							<div className="rounded-2xl bg-orange-200 flex">
								<button
									type="button"
									onClick={() => setTab("bangs")}
									className={`px-3 py-1 rounded-2xl cursor-pointer hover:bg-orange-300/50 transition-colors duration-75 ${tab === "bangs" ? "bg-orange-300!" : "orange-200"}`}
								>
									Bangs
								</button>
								<button
									type="button"
									onClick={() => setTab("back")}
									className={`px-3 py-1 rounded-2xl cursor-pointer hover:bg-orange-300/50 transition-colors duration-75 ${tab === "back" ? "bg-orange-300!" : "orange-200"}`}
								>
									Back
								</button>
							</div>
						</div>
					</div>

					<div className="flex justify-center h-74 mt-auto">
						<TypeSelector
							length={50}
							type={type}
							setType={(i) => {
								setType(i);

								// Update ref
								if (tab === "sets") {
									instructions.current.hair.setType = i;
								} else if (tab === "bangs") {
									instructions.current.hair.bangsType = i;
								} else if (tab === "back") {
									instructions.current.hair.backType = i;
								}
							}}
						/>
					</div>
				</div>

				<div className="shrink-0 w-21 pb-3 flex flex-col items-center">
					<ColorPicker
						color={color}
						setColor={(i) => {
							setColor(i);
							instructions.current.hair.color = i;
						}}
					/>

					<div className="flex gap-1.5 items-center mb-2 w-full">
						<input type="checkbox" id="subcolor" className="checkbox" checked={subColor !== null} onChange={(e) => setSubColor(e.target.checked ? 0 : null)} />
						<label htmlFor="subcolor" className="text-xs">
							Sub color
						</label>
					</div>

					<ColorPicker
						disabled={subColor === null}
						color={subColor ? subColor : 0}
						setColor={(i) => {
							setSubColor(i);
							instructions.current.hair.subColor = i;
						}}
					/>

					<div className="flex gap-1.5 items-center w-full mt-auto">
						<input type="checkbox" id="subcolor" className="checkbox" checked={isFlipped} onChange={(e) => setIsFlipped(e.target.checked)} />
						<label htmlFor="subcolor" className="text-xs">
							Flip
						</label>
					</div>
				</div>
			</div>
		</div>
	);
}
