"use client";

import { Icon } from "@iconify/react";
import { useSelect } from "downshift";
import { redirect, useSearchParams } from "next/navigation";

type Sort = "likes" | "newest";

const items = ["likes", "newest"];

export default function SortSelect() {
	const searchParams = useSearchParams();

	const currentSort = (searchParams.get("sort") as Sort) || "newest";

	const { isOpen, getToggleButtonProps, getMenuProps, getItemProps, highlightedIndex, selectedItem } = useSelect({
		items,
		selectedItem: currentSort,
		onSelectedItemChange: ({ selectedItem }) => {
			if (!selectedItem) return;
			redirect(`?sort=${selectedItem}`);
		},
	});

	return (
		<div className="relative w-full">
			{/* Toggle button to open the dropdown */}
			<button type="button" {...getToggleButtonProps()} className="pill input w-full gap-1 !justify-between">
				<span>Sort by </span>
				{selectedItem || "Select a way to sort"}
				<Icon icon="tabler:chevron-down" className="ml-2 size-5" />
			</button>

			{/* Dropdown menu */}
			<ul
				{...getMenuProps()}
				className={`absolute z-50 w-full bg-orange-200 border-2 border-orange-400 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto ${
					isOpen ? "block" : "hidden"
				}`}
			>
				{isOpen &&
					items.map((item, index) => (
						<li
							key={item}
							{...getItemProps({ item, index })}
							className={`px-4 py-1 cursor-pointer text-sm ${highlightedIndex === index ? "bg-black/15" : ""}`}
						>
							{item}
						</li>
					))}
			</ul>
		</div>
	);
}
