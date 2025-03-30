"use client";

import { Icon } from "@iconify/react";

export default function SearchBar() {
	return (
		<div className="max-w-md w-full flex rounded-xl focus-within:ring-[3px] ring-orange-400/50 transition shadow-md">
			<input
				type="text"
				placeholder="Search..."
				className="bg-orange-200 border-2 border-orange-400 py-2 px-3 rounded-l-xl outline-0 w-full placeholder:text-black/40"
			/>
			<button className="bg-orange-400 p-2 w-12 rounded-r-xl flex justify-center items-center cursor-pointer text-2xl transition-all hover:text-[1.75rem] active:text-2xl">
				<Icon icon="ic:baseline-search" />
			</button>
		</div>
	);
}
