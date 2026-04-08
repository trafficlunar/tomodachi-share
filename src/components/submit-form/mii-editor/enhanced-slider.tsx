import { Icon } from "@iconify/react";
import React, { useState, useEffect } from "react";

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

export default function EnhancedSlider({
	label,
	value,
	onChange,
	min = 0,
	max = 128,
	mid = 64,
	step = 1,
	className = "",
}: SliderProps) {
	const [internalValue, setInternalValue] = useState(value);

	// Sync with external value
	React.useEffect(() => {
		setInternalValue(value);
	}, [value]);

	const handleChange = (newValue: number) => {
		const clampedValue = Math.min(max, Math.max(min, newValue));
		setInternalValue(clampedValue);
		onChange(clampedValue);
	};

	const nudge = (direction: number) => {
		const newValue = internalValue + (direction * step);
		handleChange(newValue);
	};

	const displayValue = internalValue - mid;
	const displayText = displayValue > 0 ? `+${displayValue}` : displayValue.toString();

	return (
		<div className={`w-full ${className}`}>
			<div className="flex justify-between items-center mb-2 relative">
				<h3 className="text-sm font-semibold">{label}</h3>
				<span className="absolute left-1/2 transform -translate-x-1/2 text-xs font-bold text-orange-600 bg-white px-2 py-1 rounded-full shadow-sm">
					{displayText}
				</span>
			</div>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => nudge(-1)}
					disabled={internalValue <= min}
					className="bg-white border-2 border-orange-400 text-orange-400 font-bold w-8 h-8 rounded-lg cursor-pointer flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-orange-50"
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
						value={internalValue}
						onChange={(e) => handleChange(Number(e.target.value))}
						className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer slider-thumb"
						style={{
							background: `linear-gradient(to right, #fb923c 0%, #fb923c ${((internalValue - min) / (max - min)) * 100}%, #fed7aa ${((internalValue - min) / (max - min)) * 100}%, #fed7aa 100%)`
						}}
					/>
				</div>
				
				<button
					type="button"
					onClick={() => nudge(1)}
					disabled={internalValue >= max}
					className="bg-white border-2 border-orange-400 text-orange-400 font-bold w-8 h-8 rounded-lg cursor-pointer flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-orange-50"
					aria-label={`Increase ${label}`}
				>
					<Icon icon="mdi:chevron-right" width="16" height="16" />
				</button>
			</div>
			
			<style jsx>{`
				.slider-thumb::-webkit-slider-thumb {
					-webkit-appearance: none;
					appearance: none;
					width: 18px;
					height: 18px;
					border-radius: 50%;
					background: #fb923c;
					border: 2px solid #ea580c;
					cursor: pointer;
					box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
				}
				
				.slider-thumb::-moz-range-thumb {
					width: 18px;
					height: 18px;
					border-radius: 50%;
					background: #fb923c;
					border: 2px solid #ea580c;
					cursor: pointer;
					box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
				}
				
				.slider-thumb:focus {
					outline: none;
				}
			`}</style>
		</div>
	);
}
