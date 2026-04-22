import { useState } from "react";
import { Icon } from "@iconify/react";
import { querySchema } from "@tomodachi-share/shared/schemas";
import { useNavigate, useSearchParams } from "react-router";

export default function SearchBar() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [query, setQuery] = useState(searchParams.get("q") || "");

	const handleSearch = () => {
		const result = querySchema.safeParse(query);
		if (!result.success) {
			navigate("/", { preventScrollReset: true });
			return;
		}

		// Clone current search params and add query param
		const params = new URLSearchParams(searchParams.toString());
		params.set("q", query);
		params.set("page", "1");

		navigate(`/?${params.toString()}`, { preventScrollReset: true });
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter") handleSearch();
	};

	return (
		<div className="max-w-md w-full flex rounded-xl focus-within:ring-[3px] ring-orange-400/50 transition shadow-md dark:ring-slate-500/50">
			<input
				type="text"
				placeholder="Search..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onKeyDown={handleKeyDown}
				className="bg-orange-200 border-2 border-orange-400 py-2 px-3 rounded-l-xl outline-0 w-full placeholder:text-black/40 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-white/40"
			/>
			<button
				onClick={handleSearch}
				aria-label="Search"
				data-tooltip="Search"
				className="bg-orange-400 p-2 w-12 rounded-r-xl flex justify-center items-center cursor-pointer text-2xl dark:bg-slate-600 dark:hover:bg-slate-500"
			>
				<Icon icon="ic:baseline-search" />
			</button>
		</div>
	);
}
