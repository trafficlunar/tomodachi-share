import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { COLORS } from "@/lib/switch";

interface Props {
	disabled?: boolean;
	color: number;
	setColor: (color: number) => void;
}

export default function ColorPicker({ disabled, color, setColor }: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	const close = () => {
		setIsVisible(false);
		setTimeout(() => {
			setIsOpen(false);
		}, 300);
	};

	useEffect(() => {
		if (isOpen) {
			// slight delay to trigger animation
			setTimeout(() => setIsVisible(true), 10);
		}
	}, [isOpen]);

	return (
		<>
			<button
				type="button"
				onClick={() => {
					if (isOpen) {
						close();
					} else {
						setIsOpen(true);
					}
				}}
				disabled={disabled}
				className={`w-full flex gap-1.5 mb-2 p-2 rounded-xl shadow ${disabled ? "bg-zinc-300 opacity-50 cursor-not-allowed" : "bg-zinc-100 cursor-pointer"}`}
			>
				<Icon icon={"material-symbols:palette"} className="text-xl" />
				<div className="grow rounded" style={{ backgroundColor: `#${COLORS[color]}` }}></div>
			</button>

			{isOpen && (
				<div
					className={`absolute inset-0 w-122 p-4 bg-orange-100 rounded-lg transition-transform duration-500
						flex items-center ${isVisible ? "opacity-100" : "opacity-0"}`}
					style={{
						transition: isVisible
							? "transform 500ms cubic-bezier(0.34, 1.28, 0.64, 1), opacity 300ms"
							: "transform 1000ms cubic-bezier(0.55, 0, 0.45, 1), opacity 300ms",
					}}
				>
					<div className="mr-8 flex flex-col gap-0.5">
						{COLORS.slice(0, 8).map((c, i) => (
							<button
								type="button"
								key={i}
								onClick={() => setColor(i)}
								className={`size-7.5 cursor-pointer rounded-md ring-orange-500 ring-offset-2 ${color === i ? "ring-2 z-10" : ""}`}
								style={{
									backgroundColor: `#${c}`,
									opacity: isVisible ? 1 : 0,
									transform: isVisible ? "scale(1)" : "scale(0.7)",
									transition: `opacity 250ms ease, transform 320ms cubic-bezier(0.34, 1.4, 0.64, 1)`,
									// stagger by column then row for a wave effect
									transitionDelay: isVisible ? `${120 + (i % 10) * 18 + Math.floor(i / 10) * 10}ms` : "0ms",
								}}
							></button>
						))}
					</div>

					<div className="grid grid-cols-10 gap-0.5">
						{COLORS.slice(8, 108).map((c, i) => (
							<button
								type="button"
								key={i + 8}
								onClick={() => setColor(i + 8)}
								className={`size-7.5 cursor-pointer rounded-md ring-orange-500 ring-offset-2 ${color === i + 8 ? "ring-2 z-10" : ""}`}
								style={{
									backgroundColor: `#${c}`,
									opacity: isVisible ? 1 : 0,
									transform: isVisible ? "scale(1)" : "scale(0.7)",
									transition: `opacity 250ms ease, transform 320ms cubic-bezier(0.34, 1.4, 0.64, 1)`,
									transitionDelay: isVisible ? `${120 + (i % 10) * 18 + Math.floor(i / 10) * 10}ms` : "0ms",
								}}
							></button>
						))}
					</div>

					<button
						type="button"
						onClick={close}
						className="absolute h-full w-16 top-0 right-0 cursor-pointer transition-transform hover:scale-115 active:scale-90"
					>
						<Icon icon={"tabler:chevron-right"} className="text-4xl" />
					</button>
				</div>
			)}
		</>
	);
}
