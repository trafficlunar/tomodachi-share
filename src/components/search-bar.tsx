"use client";

import { redirect, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { querySchema } from "@/lib/schemas";

export default function SearchBar() {
	const searchParams = useSearchParams();
	const [query, setQuery] = useState("");

	const handleSearch = () => {
		const result = querySchema.safeParse(query);
		if (!result.success) redirect("/");

		// Clone current search params and add query param
		const params = new URLSearchParams(searchParams.toString());
		params.set("q", query);

		redirect(`/?${params.toString()}`);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter") handleSearch();
	};

	return (
		<div className="max-w-md w-full flex rounded-xl focus-within:ring-[3px] ring-orange-400/50 transition shadow-md">
			<input
				type="text"
				placeholder="Search..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onKeyDown={handleKeyDown}
				className="bg-orange-200 border-2 border-orange-400 py-2 px-3 rounded-l-xl outline-0 w-full placeholder:text-black/40"
			/>
			<button
				onClick={handleSearch}
				className="bg-orange-400 p-2 w-12 rounded-r-xl flex justify-center items-center cursor-pointer text-2xl transition-all hover:text-[1.75rem] active:text-2xl"
			>
				<Icon icon="ic:baseline-search" />
			</button>
		</div>
	);
}
