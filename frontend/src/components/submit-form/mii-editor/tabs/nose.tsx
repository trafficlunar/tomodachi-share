import { type SwitchMiiInstructions } from "@tomodachi-share/shared";
import NumberInputs from "../number-inputs";

interface Props {
	instructions: React.RefObject<SwitchMiiInstructions>;
}

export default function NoseTab({ instructions }: Props) {
	return (
		<>
			<h1 className="absolute font-bold text-xl">Nose</h1>

			<div className="size-full flex flex-col justify-center items-center">
				<NumberInputs target={instructions.current.nose} />
			</div>
		</>
	);
}
