"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";

import { MiiGender } from "@prisma/client";

import TagFilter from "./tag-filter";
import GenderSelect from "./gender-select";
import OtherFilters from "./other-filters";

export default function FilterMenu() {
	const searchParams = useSearchParams();

	const [isOpen, setIsOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	const rawTags = searchParams.get("tags") || "";
	const rawExclude = searchParams.get("exclude") || "";
	const gender = (searchParams.get("gender") as MiiGender) || undefined;
	const allowCopying = (searchParams.get("allowCopying") as unknown as boolean) || false;

	const tags = useMemo(
		() =>
			rawTags
				? rawTags
						.split(",")
						.map((tag) => tag.trim())
						.filter((tag) => tag.length > 0)
				: [],
		[rawTags],
	);
	const exclude = useMemo(
		() =>
			rawExclude
				? rawExclude
						.split(",")
						.map((tag) => tag.trim())
						.filter((tag) => tag.length > 0)
				: [],
		[rawExclude],
	);

	const [filterCount, setFilterCount] = useState(tags.length);

	// Filter menu button handler
	const handleClick = () => {
		if (!isOpen) {
			setIsOpen(true);
			// slight delay to trigger animation
			setTimeout(() => setIsVisible(true), 10);
		} else {
			setIsVisible(false);
			setTimeout(() => {
				setIsOpen(false);
			}, 200);
		}
	};

	// Count all active filters
	useEffect(() => {
		let count = tags.length + exclude.length;
		if (gender) count++;
		if (allowCopying) count++;

		setFilterCount(count);
	}, [tags, exclude, gender, allowCopying]);

	return (
		<div className="relative">
			<button className="pill button gap-2" onClick={handleClick}>
				<Icon icon="mdi:filter" className="text-xl" />
				Filter
				<span className="w-5">({filterCount})</span>
			</button>

			{isOpen && (
				<div
					className={`absolute w-80 left-0 top-full mt-8 z-40 flex flex-col items-center bg-orange-50
						border-2 border-amber-500 rounded-2xl shadow-lg p-4 transition-discrete duration-200 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
				>
					{/* Arrow */}
					<div className="absolute bottom-full left-1/6 -translate-x-1/2 size-0 border-8 border-transparent border-b-amber-500"></div>

					<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium w-full mb-2">
						<hr className="grow border-zinc-300" />
						<span>Tags Include</span>
						<hr className="grow border-zinc-300" />
					</div>
					<TagFilter />

					<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium w-full mt-2 mb-2">
						<hr className="grow border-zinc-300" />
						<span>Tags Exclude</span>
						<hr className="grow border-zinc-300" />
					</div>
					<TagFilter isExclude />

					<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium w-full mt-2 mb-1">
						<hr className="grow border-zinc-300" />
						<span>Gender</span>
						<hr className="grow border-zinc-300" />
					</div>
					<GenderSelect />

					<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium w-full mt-2 mb-1">
						<hr className="grow border-zinc-300" />
						<span>Other</span>
						<hr className="grow border-zinc-300" />
					</div>
					<OtherFilters />
				</div>
			)}
		</div>
	);
}
