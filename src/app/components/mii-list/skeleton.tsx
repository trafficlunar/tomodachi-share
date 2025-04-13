export default function Skeleton() {
	return (
		<div className="flex flex-col bg-zinc-50 rounded-3xl border-2 border-zinc-300 shadow-lg p-3 animate-pulse">
			{/* Carousel Skeleton */}
			<div className="relative rounded-xl bg-zinc-300 border-2 border-zinc-300 mb-1">
				<div className="aspect-[3/2]"></div>
			</div>

			{/* Content */}
			<div className="p-4 flex flex-col gap-1 h-full">
				{/* Name */}
				<div className="h-7 bg-zinc-300 rounded w-2/3 mb-0.5" />

				{/* Tags */}
				<div className="flex flex-wrap gap-1">
					<div className="px-4 py-2 bg-orange-200 rounded-full w-14 h-6" />
					<div className="px-4 py-2 bg-orange-200 rounded-full w-10 h-6" />
				</div>

				{/* Bottom row */}
				<div className="mt-0.5 grid grid-cols-2 items-center">
					<div className="h-6 w-12 bg-red-200 rounded" />
					<div className="h-4 w-24 bg-zinc-200 rounded justify-self-end" />
				</div>
			</div>
		</div>
	);
}
