import { notFound } from "next/navigation";
import { z } from "zod";

import MiiList from "../components/mii-list";

interface Props {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const searchSchema = z
	.string()
	.trim()
	.min(2)
	.max(64)
	.regex(/^[a-zA-Z0-9_]+$/);

export default async function SearchPage({ searchParams }: Props) {
	const { q: rawQuery } = await searchParams;

	const result = searchSchema.safeParse(rawQuery);
	if (!result.success) notFound();

	const query = result.data.toLowerCase();

	return (
		<div>
			<p className="text-lg">
				Search results for "<span className="font-bold">{query}</span>"
			</p>
			<MiiList
				searchParams={searchParams}
				where={{
					OR: [{ name: { contains: query, mode: "insensitive" } }, { tags: { has: query } }],
				}}
			/>
		</div>
	);
}
