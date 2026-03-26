import { SwitchMiiInstructions } from "@/types";
import NumberInputs from "../number-inputs";

interface EarsProps {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

export default function EarsTab({ instructions }: EarsProps) {
	return (
		<>
			<h1 className="absolute font-bold text-xl">Ears</h1>

			<div className="size-full flex flex-col justify-center items-center">
				<NumberInputs target={instructions.current.ears} />
			</div>
		</>
	);
}
