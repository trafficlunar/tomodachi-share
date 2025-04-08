export default function QrFinder() {
	return (
		<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none size-72 z-10">
			{/* Top-left corner */}
			<div className="absolute top-0 left-0 size-6 border-t-3 border-l-3 border-amber-500 rounded-tl-lg" />

			{/* Top-right corner */}
			<div className="absolute top-0 right-0 size-6 border-t-3 border-r-3 border-amber-500 rounded-tr-lg" />

			{/* Bottom-left corner */}
			<div className="absolute bottom-0 left-0 size-6 border-b-3 border-l-3 border-amber-500 rounded-bl-lg" />

			{/* Bottom-right corner */}
			<div className="absolute bottom-0 right-0 size-6 border-b-3 border-r-3 border-amber-500 rounded-br-lg" />

			{/* Center point */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-5 bg-amber-500/70 rounded-full" />
		</div>
	);
}
