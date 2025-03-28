"use client";

import { Icon } from "@iconify/react";

export default function SearchBar() {
	return (
		<div className="max-w-md w-full flex rounded-xl focus-within:ring-[3px] ring-orange-200/75 transition shadow-md">
			<input type="text" placeholder="Search..." className="bg-orange-300 border-2 border-orange-400 py-2 px-3 rounded-l-xl outline-0 w-full" />
			<button className="bg-orange-400 p-2 w-12 rounded-r-xl flex justify-center items-center">
				<Icon icon="ic:baseline-search" fontSize={24} />
			</button>
		</div>
	);
}
