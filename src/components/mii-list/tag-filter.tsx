"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import TagSelector from "../tag-selector";

export default function TagFilter() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [, startTransition] = useTransition();

	const rawTags = searchParams.get("tags") || "";
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

	const [tags, setTags] = useState<string[]>(preexistingTags);

	// Redirect automatically on tags change
	useEffect(() => {
		const urlTags = preexistingTags.join(",");
		const stateTags = tags.join(",");

		if (urlTags === stateTags) return;

		const params = new URLSearchParams(searchParams);
		if (tags.length > 0) {
			params.set("tags", stateTags);
		} else {
			params.delete("tags");
		}

		startTransition(() => {
			router.push(`?${params.toString()}`);
		});
	}, [tags, preexistingTags, searchParams, router]);

	return (
		<div className="w-72">
			<TagSelector tags={tags} setTags={setTags} />
		</div>
	);
}
