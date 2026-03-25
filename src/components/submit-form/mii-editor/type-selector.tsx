import { Fragment } from "react/jsx-runtime";

interface Props {
	hasNoneOption?: boolean;
	isGlassesTab?: boolean;
	length: number;
	type: number | null;
	setType: (type: number) => void;
}

export default function TypeSelector({ hasNoneOption, isGlassesTab, length, type, setType }: Props) {
	return (
		<div className="grid grid-cols-5 gap-1 w-fit overflow-y-auto h-fit max-h-full">
			{Array.from({ length }).map((_, i) => (
				<Fragment key={i}>
					<button
						type="button"
						onClick={() => setType(i)}
						className={`size-12 cursor-pointer hover:bg-orange-300 transition-colors duration-100 rounded-xl ${type === i ? "bg-orange-400!" : ""} ${hasNoneOption && i === 0 ? "text-md" : "text-2xl"}`}
					>
						{hasNoneOption ? (i === 0 ? "None" : i + 1) : i + 1}
					</button>

					{isGlassesTab && i === 43 && <div />}
				</Fragment>
			))}
		</div>
	);
}
