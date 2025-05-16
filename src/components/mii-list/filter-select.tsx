"use client";

import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import TagSelector from "../tag-selector";

export default function FilterSelect() {
	const searchParams = useSearchParams();

	const rawTags = searchParams.get("tags");
	const preexistingTags = useMemo(
		() =>
			rawTags
				? rawTags
						.split(",")
						.map((tag) => tag.trim())
						.filter((tag) => tag.length > 0)
				: [],
		[rawTags]
	);

	const [isOpen, setIsOpen] = useState(false);
	const [tags, setTags] = useState<string[]>(preexistingTags);

	const handleSubmit = () => {
		redirect(`/?tags=${encodeURIComponent(tags.join(","))}`);
	};

	useEffect(() => {
		setTags(preexistingTags);
	}, [preexistingTags]);

	return (
		<div className="relative">
			<button onClick={() => setIsOpen((prev) => !prev)} className="pill button gap-1 text-nowrap">
				Filter{" "}
				{tags.length > 0 ? (
					<span>
						({tags.length} {tags.length == 1 ? "filter" : "filters"})
					</span>
				) : (
					""
				)}
			</button>

			<div
				className={`absolute z-40 left-1/2 -translate-x-1/2 w-96 bg-orange-200 border-2 border-orange-400 rounded-lg mt-1 shadow-lg flex flex-col justify-between gap-2 p-2 max-[32rem]:-left-8 max-[32rem]:w-80 max-[32rem]:translate-x-0 ${
					isOpen ? "block" : "hidden"
				}`}
			>
				<div>
					<label className="text-sm ml-2">Tags</label>
					<TagSelector tags={tags} setTags={setTags} />
				</div>

				<button onClick={handleSubmit} className="pill button text-sm !px-3 !py-0.5 w-min">
					Submit
				</button>
			</div>
		</div>
	);
}
