export default function Page() {
	return (
		<div className="max-w-5xl grid grid-cols-3 gap-4">
			{/* testing purposes only */}
			{[...Array(3)].map((_, index) => (
				<div key={index} className="bg-zinc-50 rounded-3xl border-2 border-amber-300 shadow-lg p-3 transition hover:scale-105">
					<img src="https://placehold.co/600x400" alt="mii" className="rounded-xl" />
					<div className="p-4">
						<h3 className="font-bold text-2xl">Frieren</h3>
						<div id="tags" className="flex gap-1 mt-1 *:px-2 *:py-1 *:bg-orange-300 *:rounded-full *:text-xs">
							<span>Anime</span>
							<span>Test</span>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
