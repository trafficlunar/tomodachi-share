import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

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
								onClick={() => {
									setColor(i);
									close();
								}}
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
								onClick={() => {
									setColor(i + 8);
									close();
								}}
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

const COLORS: string[] = [
	// Outside
	"000000",
	"8E8E93",
	"6B4F0F",
	"5A2A0A",
	"7A1E0E",
	"A0522D",
	"A56B2A",
	"D4A15A",
	// Row 1
	"F2F2F2",
	"E6D5C3",
	"F3E6A2",
	"CDE6A1",
	"A9DFA3",
	"8ED8B0",
	"8FD3E8",
	"C9C2E6",
	"F3C1CF",
	"F0A8A8",
	// Row 2
	"D8D8D8",
	"E8C07D",
	"F0D97A",
	"CDE07A",
	"7BC96F",
	"6BC4B2",
	"5BBAD6",
	"D9A7E0",
	"F7B6C2",
	"F47C6C",
	// Row 3
	"C0C0C0",
	"D9A441",
	"F4C542",
	"D4C86A",
	"8FD14F",
	"58B88A",
	"6FA8DC",
	"B4A7D6",
	"F06277",
	"FF6F61",
	// Row 4
	"A8A8A8",
	"D29B62",
	"F2CF75",
	"D8C47A",
	"8DB600",
	"66C2A5",
	"4DA3D9",
	"C27BA0",
	"D35D6E",
	"FF4C3B",
	// Row 5
	"9A9A9A",
	"C77800",
	"F4B183",
	"D6BF3A",
	"3FA34D",
	"4CA3A3",
	"7EA6E0",
	"B56576",
	"FF1744",
	"FF2A00",
	// Row 6
	"8A817C",
	"B85C1E",
	"FF8C00",
	"D2B48C",
	"2E8B57",
	"2F7E8C",
	"2E86C1",
	"7D5BA6",
	"C2185B",
	"E0193A",
	// Row 7
	"6E6E6E",
	"95543A",
	"F4A460",
	"B7A369",
	"3B7A0A",
	"1F6F78",
	"3F51B5",
	"673AB7",
	"B71C1C",
	"C91F3A",
	// Row 8
	"3E3E3E",
	"8B5A2B",
	"F0986C",
	"9E8F2A",
	"0B5D3B",
	"0E3A44",
	"1F2A44",
	"4B2E2E",
	"9C1B1B",
	"7A3B2E",
	// Row 9
	"2E2E2E",
	"7A4A2A",
	"A86A1D",
	"6E6B2A",
	"2F6F55",
	"004E52",
	"1C2F6E",
	"3A1F4D",
	"A52A2A",
	"8B4513",
	// Row 10
	"000000",
	"5A2E0C",
	"7B3F00",
	"5C4A00",
	"004225",
	"003B44",
	"0A1F44",
	"2B1B3F",
	"7B2D2D",
	"8B3A0E",
	// Head tab extra colors
	"FFD8BA",
	"FFD5AC",
	"FEC1A4",
	"FEC68F",
	"FEB089",
	"FEBA6B",
	"F39866",
	"E89854",
	"E37E3F",
	"B45627",
	"914220",
	"59371F",
	"662D16",
	"392D1E",
];
