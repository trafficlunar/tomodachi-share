import { useEffect, useMemo, useState, useTransition } from "react";
import TagSelector from "../../tag-selector";

interface Props {
	isExclude?: boolean;
}

export default function TagFilter({ isExclude }: Props) {
	const searchParams = new URLSearchParams(window.location.search);
	const [, startTransition] = useTransition();

	const rawTags = searchParams.get(isExclude ? "exclude" : "tags") || "";
	const preexistingTags = useMemo(
		() =>
			rawTags
				? rawTags
						.split(",")
						.map((tag) => tag.trim())
						.filter((tag) => tag.length > 0)
				: [],
		[rawTags],
	);

	const [tags, setTags] = useState<string[]>(preexistingTags);

	// Sync state if the URL tags change (e.g. via navigation)
	useEffect(() => {
		setTags(preexistingTags);
	}, [preexistingTags]);

	// Redirect automatically on tags change
	useEffect(() => {
		const urlTags = preexistingTags.join(",");
		const stateTags = tags.join(",");

		if (urlTags === stateTags) return;

		const params = new URLSearchParams(searchParams);
		params.set("page", "1");

		if (tags.length > 0) {
			params.set(isExclude ? "exclude" : "tags", stateTags);
		} else {
			params.delete(isExclude ? "exclude" : "tags");
		}

		startTransition(() => {
			// router.push(`?${params.toString()}`, { scroll: false });
			window.location.href = `?${params.toString()}`;
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tags]);

	return (
		<div className="w-72">
			<TagSelector tags={tags} setTags={setTags} isExclude={isExclude} />
		</div>
	);
}
