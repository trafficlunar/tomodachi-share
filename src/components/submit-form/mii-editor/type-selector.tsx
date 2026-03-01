interface Props {
	hasNoneOption?: boolean;
	length: number;
	type: number;
	setType: (type: number) => void;
}

export default function TypeSelector({ hasNoneOption, length, type, setType }: Props) {
	return (
		<div className="grid grid-cols-5 gap-1 w-fit overflow-y-auto h-fit max-h-full">
			{Array.from({ length }).map((_, i) => (
				<button
					type="button"
					key={i}
					onClick={() => setType(i)}
					className={`size-12 cursor-pointer hover:bg-orange-300 transition-colors duration-100 rounded-xl ${type === i ? "bg-orange-400!" : ""} ${hasNoneOption && i === 0 ? "text-md" : "text-2xl"}`}
				>
					{hasNoneOption ? (i === 0 ? "None" : i) : i + 1}
				</button>
			))}
		</div>
	);
}
