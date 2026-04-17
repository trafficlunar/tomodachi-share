import { Icon } from "@iconify/react";

interface SliderProps {
	label: string;
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	mid?: number;
	step?: number;
	className?: string;
}

export default function EnhancedSlider({ label, value, onChange, min = 0, max = 128, mid = 64, step = 1, className = "" }: SliderProps) {
	const handleChange = (newValue: number) => {
		const clampedValue = Math.min(max, Math.max(min, newValue));
		onChange(clampedValue);
	};

	const nudge = (direction: number) => {
		const newValue = value + direction * step;
		handleChange(newValue);
	};

	const displayValue = value - mid;
	const displayText = displayValue > 0 ? `+${displayValue}` : displayValue.toString();
	const percentage = ((value - min) / (max - min)) * 100;

	return (
		<div className={`w-full ${className}`}>
			<div className="flex justify-between items-center my-1 relative">
				<h3 className="text-sm font-semibold">{label}</h3>
				<span className="absolute left-1/2 transform -translate-x-1/2 text-xs font-bold text-orange-600 bg-orange-50 border-2 border-orange-400 px-2 py-1 rounded-full shadow-sm">
					{displayText}
				</span>
			</div>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => nudge(-1)}
					disabled={value <= min}
					className="bg-orange-50 border-2 border-orange-400 text-orange-400 font-bold size-7 rounded-lg cursor-pointer flex items-center justify-center shrink-0 transition-transform not-disabled:active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-orange-50"
					aria-label={`Decrease ${label}`}
				>
					<Icon icon="mdi:chevron-left" width="16" height="16" />
				</button>

				<div className="relative flex-1 h-8 flex items-center">
					{/* Tick mark at center */}
					<div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 bg-orange-400 rounded z-10 opacity-60"></div>

					<input
						type="range"
						min={min}
						max={max}
						step={step}
						value={value}
						onChange={(e) => handleChange(e.target.valueAsNumber)}
						className="w-full px-0.5 h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer focus:outline-0"
						style={{
							background: `linear-gradient(to right, #fb923c 0%, #fb923c ${percentage}%, #fed7aa ${percentage}%, #fed7aa 100%)`,
						}}
					/>
				</div>

				<button
					type="button"
					onClick={() => nudge(1)}
					disabled={value >= max}
					className="bg-orange-50 border-2 border-orange-400 text-orange-400 font-bold size-7 rounded-lg cursor-pointer flex items-center justify-center shrink-0 transition-transform not-disabled:active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-orange-50"
					aria-label={`Increase ${label}`}
				>
					<Icon icon="mdi:chevron-right" width="16" height="16" />
				</button>
			</div>
		</div>
	);
}
