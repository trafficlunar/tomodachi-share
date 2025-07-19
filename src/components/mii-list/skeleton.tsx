import FilterSelect from "./tag-filter";
import SortSelect from "./sort-select";
import Pagination from "./pagination";

export default function Skeleton() {
	return (
		<div className="w-full animate-pulse">
			<div className="flex justify-between items-end mb-2 max-[32rem]:flex-col max-[32rem]:items-center">
				<p className="text-lg">
					<span className="font-extrabold">???</span> Miis
				</p>

				<div className="flex gap-2 pointer-events-none">
					<FilterSelect />
					<SortSelect />
				</div>
			</div>

			<div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-[30rem]:grid-cols-1">
				{[...Array(24)].map((_, index) => (
					<div key={index} className="flex flex-col bg-zinc-50 rounded-3xl border-2 border-zinc-300 shadow-lg p-3">
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
				))}
			</div>

			<div className="pointer-events-none">
				<Pagination lastPage={10} />
			</div>
		</div>
	);
}
