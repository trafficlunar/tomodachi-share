import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import LikeButton from "./components/like-button";

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
	const session = await auth();
	const resolvedSearchParams = await searchParams;

	// sort search param
	const orderBy: { createdAt?: Prisma.SortOrder; likes?: Prisma.SortOrder } = {};

	if (resolvedSearchParams.sort === "newest") {
		orderBy.createdAt = "desc";
	} else if (resolvedSearchParams.sort === "likes") {
		orderBy.likes = "desc";
	} else {
		orderBy.createdAt = "desc"; // Default to newest if no valid sort is provided
	}

	// tag search param
	const rawTags = resolvedSearchParams.tags;
	const tagFilter =
		typeof rawTags === "string"
			? rawTags
					.split(",")
					.map((tag) => tag.trim())
					.filter((tag) => tag.length > 0)
			: [];
	const where = tagFilter.length > 0 ? { tags: { hasSome: tagFilter } } : undefined;

	const miiCount = prisma.mii.count();
	const miis = await prisma.mii.findMany({
		where: where,
		orderBy,
	});

	return (
		<div className="w-full">
			<div className="flex justify-between items-end mb-2">
				<p className="text-lg">
					<span className="font-extrabold">{miiCount}</span> Miis
				</p>

				<div className="flex gap-2">
					{/* todo: replace with react-select */}
					<div className="pill gap-2">
						<label htmlFor="sort">Filter:</label>
						<span>todo</span>
					</div>

					<div className="pill gap-2">
						<label htmlFor="sort">Sort:</label>
						<select name="sort">
							<option value="likes">Likes</option>
							<option value="newest">Newest</option>
						</select>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-sm:grid-cols-2 max-[25rem]:grid-cols-1">
				{miis.map((mii) => (
					<div
						key={mii.id}
						className="bg-zinc-50 rounded-3xl border-2 border-zinc-300 shadow-lg p-3 transition hover:scale-105 hover:bg-cyan-100 hover:border-cyan-600"
					>
						<img src="https://placehold.co/600x400" alt="mii" className="rounded-xl" />
						<div className="p-4">
							<h3 className="font-bold text-2xl">{mii.name}</h3>
							<div id="tags" className="flex gap-1 mt-1 *:px-2 *:py-1 *:bg-orange-300 *:rounded-full *:text-xs">
								{mii.tags.map((tag) => (
									<span key={tag}>{tag}</span>
								))}
							</div>

							<LikeButton likes={mii.likes} isLoggedIn={session?.user != null} />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
