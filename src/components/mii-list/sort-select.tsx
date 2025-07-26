"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useSelect } from "downshift";
import { Icon } from "@iconify/react";

type Sort = "likes" | "newest" | "oldest" | "random";

const items = ["likes", "newest", "oldest", "random"];

export default function SortSelect() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [, startTransition] = useTransition();

	const currentSort = (searchParams.get("sort") as Sort) || "newest";

	const { isOpen, getToggleButtonProps, getMenuProps, getItemProps, highlightedIndex, selectedItem } = useSelect({
		items,
		selectedItem: currentSort,
		onSelectedItemChange: ({ selectedItem }) => {
			if (!selectedItem) return;

			const params = new URLSearchParams(searchParams);
			params.set("sort", selectedItem);

			if (selectedItem == "random") {
				params.set("seed", Math.floor(Math.random() * 1_000_000_000).toString());
			}

			startTransition(() => {
				router.push(`?${params.toString()}`);
			});
		},
	});

	return (
		<div className="relative w-fit">
			{/* Toggle button to open the dropdown */}
			<button type="button" {...getToggleButtonProps()} aria-label="Sort dropdown" className="pill input w-full gap-1 !justify-between text-nowrap">
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
