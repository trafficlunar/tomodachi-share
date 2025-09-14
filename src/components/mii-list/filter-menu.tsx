"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";

import { MiiGender, MiiPlatform } from "@prisma/client";

import TagFilter from "./tag-filter";
import PlatformSelect from "./platform-select";
import GenderSelect from "./gender-select";

export default function FilterMenu() {
	const searchParams = useSearchParams();

	const [isOpen, setIsOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	const rawTags = searchParams.get("tags") || "";
	const platform = (searchParams.get("platform") as MiiPlatform) || undefined;
	const gender = (searchParams.get("gender") as MiiGender) || undefined;

	const tags = useMemo(
		() =>
			rawTags
				? rawTags
						.split(",")
						.map((tag) => tag.trim())
						.filter((tag) => tag.length > 0)
				: [],
		[rawTags]
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
		let count = tags.length;
		if (platform) count++;
		if (gender) count++;

		setFilterCount(count);
	}, [tags, platform, gender]);

	return (
		<div className="relative">
			<button className="pill button gap-2" onClick={handleClick}>
				<Icon icon="mdi:filter" className="text-xl" />
				Filter {filterCount !== 0 ? `(${filterCount})` : ""}
			</button>

			{isOpen && (
				<div
					className={`absolute w-80 left-0 top-full mt-8 z-50 flex flex-col items-center bg-orange-50
						border-2 border-amber-500 rounded-2xl shadow-lg p-4 transition-discrete duration-200 ${
							isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
						}`}
				>
					{/* Arrow */}
					<div className="absolute bottom-full left-1/6 -translate-x-1/2 size-0 border-8 border-transparent border-b-amber-500"></div>

					<TagFilter />

					<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium w-full mt-2 mb-1">
						<hr className="flex-grow border-zinc-300" />
						<span>Platform</span>
						<hr className="flex-grow border-zinc-300" />
					</div>
					<PlatformSelect />

					<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium w-full mt-2 mb-1">
						<hr className="flex-grow border-zinc-300" />
						<span>Gender</span>
						<hr className="flex-grow border-zinc-300" />
					</div>
					<GenderSelect />
				</div>
			)}
		</div>
	);
}
