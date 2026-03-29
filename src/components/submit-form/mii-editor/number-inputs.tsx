import { Icon } from "@iconify/react";
import { useState } from "react";

interface Props {
	target: { height?: number; distance?: number; rotation?: number; size?: number; stretch?: number } | any;
}

export default function NumberInputs({ target }: Props) {
	const [values, setValues] = useState<Record<string, number>>({
		height: 0,
		distance: 0,
		rotation: 0,
		size: 0,
		stretch: 0,
	});

	if (!target) return null;

	return (
		<div className="grid grid-cols-2 gap-x-4 h-min w-fit">
			{["Height", "Distance", "Rotation", "Size", "Stretch"].map(
				(label) =>
					target[label.toLowerCase()] !== undefined && (
						<NumberField
							key={label}
							label={label}
							value={values[label.toLowerCase()]}
							onChange={(value) => {
								const field = label.toLowerCase();
								setValues((prev) => ({ ...prev, [field]: value }));
								target[field] = value;
							}}
						/>
					),
			)}
		</div>
	);
}

interface NumberFieldProps {
	label: string;
	value: number;
	onChange: (value: number) => void;
}

function NumberField({ label, value, onChange }: NumberFieldProps) {
	const MIN = -100;
	const MAX = 100;

	const decrement = () => onChange(Math.max(MIN, value - 1));
	const increment = () => onChange(Math.min(MAX, value + 1));

	return (
		<div>
			<label htmlFor={label} className="text-xs">
				{label}
			</label>
			<div className="pill input text-sm py-1! px-2! w-full flex items-center gap-1">
				<button
					type="button"
					onClick={decrement}
					disabled={value <= MIN}
					className="cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-30"
					aria-label={`Decrease ${label}`}
				>
					<Icon icon="mdi:minus" width="16" height="16" />
				</button>
				<input
					type="number"
					id={label}
					min={MIN}
					max={MAX}
					value={value}
					onChange={(e) => {
						const val = Math.min(MAX, Math.max(MIN, Number(e.target.value)));
						onChange(val);
					}}
					className="w-full text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
				/>
				<button
					type="button"
					onClick={increment}
					disabled={value >= MAX}
					className="cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-30"
					aria-label={`Increase ${label}`}
				>
					<Icon icon="mdi:plus" width="16" height="16" />
				</button>
			</div>
		</div>
	);
}
