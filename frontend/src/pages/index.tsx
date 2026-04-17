import { Suspense, useEffect, useState } from "react";
import FilterMenu from "../components/mii/list/filter-menu";
import SortSelect from "../components/mii/list/sort-select";
import MiiGrid from "../components/mii/list/mii-grid";
import Pagination from "../components/pagination";
import Skeleton from "../components/mii/list/skeleton";
import { useSearchParams } from "react-router";

interface ApiResponse {
	totalCount: number;
	miis: any[];
	lastPage: number;
}

export default function IndexPage() {
	const [searchParams] = useSearchParams();
	const [data, setData] = useState<ApiResponse | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch(`${import.meta.env.VITE_API_URL}/api/mii/list?${searchParams.toString()}`)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch Miis");
				return res.json();
			})
			.then((data) => {
				setData(data);
				setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				setLoading(false);
			});
	}, [searchParams]);

	return (
		<>
			<h1 className="sr-only">
				{searchParams.get("tags") ? `Miis tagged with '${searchParams.get("tags")}' - TomodachiShare` : "TomodachiShare - index mii list"}
			</h1>

			<p className="text-center mb-4">We're currently going through some major code changes therefore some features won't work.</p>

			<Suspense fallback={<Skeleton />}>
				{!loading && data ? (
					<div className="w-full">
						<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex justify-between items-center gap-2 mb-2 max-md:flex-col">
							<div className="flex items-center gap-2">
								<span className="text-2xl font-bold text-amber-900">{data.totalCount}</span>
								<span className="text-lg text-amber-700">{data.totalCount === 1 ? "Mii" : "Miis"}</span>
							</div>

							<div className="relative flex items-center justify-end gap-2 w-full md:max-w-2/3 max-md:justify-center">
								<FilterMenu />
								<SortSelect />
							</div>
						</div>

						<MiiGrid miis={data.miis} />
						<Pagination lastPage={data.lastPage} />
					</div>
				) : (
					<p>No Miis found :( Has the server died?</p>
				)}
			</Suspense>
		</>
	);
}
