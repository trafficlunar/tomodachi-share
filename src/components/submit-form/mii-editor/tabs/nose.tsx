import { SwitchMiiInstructions } from "@/types";
import TypeSelector from "../type-selector";
import NumberInputs from "../number-inputs";
import { useState } from "react";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

export default function NoseTab({ instructions }: Props) {
	const [type, setType] = useState(5);

	return (
		<div className="relative grow p-3 pb-0!">
			<div className="flex h-full">
				<div className="grow flex flex-col">
					<div className="flex items-center h-8">
						<h1 className="font-bold text-xl">Nose</h1>
					</div>

					<div className="flex justify-center h-74 mt-auto">
						<TypeSelector
							length={32}
							type={type}
							setType={(i) => {
								setType(i);
								instructions.current.nose.type = i;
							}}
						/>
					</div>
				</div>

				<div className="shrink-0 w-21 pb-3 flex flex-col items-center">
					<NumberInputs target={instructions.current.nose} />
				</div>
			</div>
		</div>
	);
}
