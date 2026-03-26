import { useState } from "react";

interface Props {
	target: { height?: number; distance?: number; rotation?: number; size?: number; stretch?: number } | any;
}

export default function NumberInputs({ target }: Props) {
	const [height, setHeight] = useState(0);
	const [distance, setDistance] = useState(0);
	const [rotation, setRotation] = useState(0);
	const [size, setSize] = useState(0);
	const [stretch, setStretch] = useState(0);

	if (!target) return null;

	return (
		<div className="grid grid-cols-2 gap-x-4 h-min w-fit">
			{target.height !== undefined && (
				<div>
					<label htmlFor="height" className="text-xs">
						Height
					</label>
					<input
						type="number"
						id="height"
						min={-5}
						max={5}
						value={height}
						onChange={(e) => {
							const value = Number(e.target.value);
							setHeight(value);
							target.height = value;
						}}
						className="pill input text-sm py-1! px-3! w-full"
					/>
				</div>
			)}

			{target.distance !== undefined && (
				<div>
					<label htmlFor="distance" className="text-xs">
						Distance
					</label>
					<input
						type="number"
						id="distance"
						min={-5}
						max={5}
						value={distance}
						onChange={(e) => {
							const value = Number(e.target.value);
							setDistance(value);
							target.distance = value;
						}}
						className="pill input text-sm py-1! px-3! w-full"
					/>
				</div>
			)}

			{target.rotation !== undefined && (
				<div>
					<label htmlFor="rotation" className="text-xs">
						Rotation
					</label>
					<input
						type="number"
						id="rotation"
						min={-5}
						max={5}
						value={rotation}
						onChange={(e) => {
							const value = Number(e.target.value);
							setRotation(value);
							target.rotation = value;
						}}
						className="pill input text-sm py-1! px-3! w-full"
					/>
				</div>
			)}

			{target.size !== undefined && (
				<div>
					<label htmlFor="size" className="text-xs">
						Size
					</label>
					<input
						type="number"
						id="size"
						min={-5}
						max={5}
						value={size}
						onChange={(e) => {
							const value = Number(e.target.value);
							setSize(value);
							target.size = value;
						}}
						className="pill input text-sm py-1! px-3! w-full"
					/>
				</div>
			)}

			{target.stretch !== undefined && (
				<div>
					<label htmlFor="stretch" className="text-xs">
						Stretch
					</label>
					<input
						type="number"
						id="stretch"
						min={-5}
						max={5}
						value={stretch}
						onChange={(e) => {
							const value = Number(e.target.value);
							setStretch(value);
							target.stretch = value;
						}}
						className="pill input text-sm py-1! px-3! w-full"
					/>
				</div>
			)}
		</div>
	);
}
