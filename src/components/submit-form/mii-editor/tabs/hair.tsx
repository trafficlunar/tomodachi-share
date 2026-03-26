import { SwitchMiiInstructions } from "@/types";
import { useState } from "react";
import ColorPicker from "../color-picker";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

type Tab = "sets" | "bangs" | "back";

export default function HairTab({ instructions }: Props) {
	const [tab, setTab] = useState<Tab>("sets");
	const [color, setColor] = useState(0);
	const [subColor, setSubColor] = useState<number | null>(null);
	const [subColor2, setSubColor2] = useState<number | null>(null);
	const [style, setStyle] = useState<number | null>(null);
	const [isFlipped, setIsFlipped] = useState(false);

	return (
		<>
			<h1 className="absolute font-bold text-xl">Hair</h1>

			<div className="absolute right-3 z-10 flex justify-end">
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

			<div className="absolute inset-0 flex flex-col justify-center items-center">
				<ColorPicker
					color={color}
					setColor={(i) => {
						setColor(i);
						instructions.current.hair.color = i;
					}}
				/>

				<div className="flex gap-1.5 items-center mb-2">
					<input
						type="checkbox"
						id="subcolor"
						className="checkbox"
						checked={tab === "back" ? subColor2 !== null : subColor !== null}
						onChange={(e) => {
							if (tab === "back") {
								setSubColor2(e.target.checked ? 0 : null);
								instructions.current.hair.subColor2 = e.target.checked ? 0 : null;
							} else {
								setSubColor(e.target.checked ? 0 : null);
								instructions.current.hair.subColor = e.target.checked ? 0 : null;
							}
						}}
					/>
					<label htmlFor="subcolor" className="text-xs">
						Sub color
					</label>
				</div>

				<ColorPicker
					disabled={tab === "back" ? subColor2 === null : subColor === null}
					color={tab === "back" ? (subColor2 ?? 0) : (subColor ?? 0)}
					setColor={(i) => {
						if (tab === "back") {
							setSubColor2(i);
							instructions.current.hair.subColor2 = i;
						} else {
							setSubColor(i);
							instructions.current.hair.subColor = i;
						}
					}}
				/>

				<p className="text-sm mb-1">Tying style</p>
				<div className="grid grid-cols-3 gap-0.5">
					{Array.from({ length: 3 }).map((_, i) => (
						<button
							type="button"
							key={i}
							onClick={() => {
								setStyle(i);
								instructions.current.hair.style = i;
							}}
							className={`size-full aspect-square cursor-pointer hover:bg-orange-300 transition-colors duration-100 rounded-lg ${style === i ? "bg-orange-400!" : ""}`}
						>
							{i + 1}
						</button>
					))}
				</div>

				<div className="flex gap-1.5 items-center mt-4">
					<input
						type="checkbox"
						id="subcolor"
						className="checkbox"
						checked={isFlipped}
						onChange={(e) => {
							setIsFlipped(e.target.checked);
							instructions.current.hair.isFlipped = e.target.checked;
						}}
					/>
					<label htmlFor="subcolor" className="text-xs">
						Flip
					</label>
				</div>
			</div>
		</>
	);
}
