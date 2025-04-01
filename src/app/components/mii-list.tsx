import Link from "next/link";
import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import Carousel from "./carousel";
import LikeButton from "./like-button";

interface Props {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
	// for use on profiles
	userId?: number;
	where?: Record<string, any>;
}

export default async function MiiList({ searchParams, userId, where }: Props) {
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
	const whereTags = tagFilter.length > 0 ? { tags: { hasSome: tagFilter } } : undefined;

	// If the mii list is on a user's profile, don't query for the username
	const userInclude =
		userId == null
			? {
					user: {
						select: {
							id: true,
							username: true,
						},
					},
			  }
			: {};

	const totalMiiCount = await prisma.mii.count({ where: { userId } });
	const shownMiiCount = await prisma.mii.count({
		where: {
			...whereTags,
			...where,
			userId,
		},
	});

	const miis = await prisma.mii.findMany({
		where: {
			...whereTags,
			...where,
			userId,
		},
		orderBy,
		include: {
			...userInclude,
			likedBy: {
				where: userId
					? {
							userId: Number(session?.user.id),
					  }
					: {},
				select: {
					userId: true,
				},
			},
			_count: {
				select: { likedBy: true },
			},
		},
	});

	const formattedMiis = miis.map((mii) => ({
		...mii,
		likes: mii._count.likedBy,
		isLikedByUser: mii.likedBy.length > 0, // True if the user has liked the Mii
	}));

	return (
		<div className="w-full">
			<div className="flex justify-between items-end mb-2">
				<p className="text-lg">
					{totalMiiCount == shownMiiCount ? (
						<>
							<span className="font-extrabold">{totalMiiCount}</span> Miis
						</>
					) : (
						<>
							<span className="font-extrabold">{shownMiiCount}</span> of <span className="font-extrabold">{totalMiiCount}</span> Miis
						</>
					)}
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

			{miis.length > 0 ? (
				<div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-sm:grid-cols-2 max-[25rem]:grid-cols-1">
					{formattedMiis.map((mii) => (
						<div
							key={mii.id}
							className="flex flex-col bg-zinc-50 rounded-3xl border-2 border-zinc-300 shadow-lg p-3 transition hover:scale-105 hover:bg-cyan-100 hover:border-cyan-600"
						>
							<Carousel images={mii.images.length > 0 ? mii.images : ["/missing.webp"]} />

							<div className="p-4 flex flex-col gap-1 h-full">
								<Link href={`/mii/${mii.id}`} className="font-bold text-2xl overflow-hidden text-ellipsis line-clamp-2" title={mii.name}>
									{mii.name}
								</Link>
								<div id="tags" className="flex gap-1 *:px-2 *:py-1 *:bg-orange-300 *:rounded-full *:text-xs">
									{mii.tags.map((tag) => (
										<Link href={{ query: { tags: tag } }} key={tag}>
											{tag}
										</Link>
									))}
								</div>

								<div className="mt-auto grid grid-cols-2 items-center">
									<LikeButton likes={mii.likes} miiId={mii.id} isLiked={mii.isLikedByUser} isLoggedIn={session?.user != null} />

									{userId == null && (
										<Link href={`/profile/${mii.user.id}`} className="text-sm text-right overflow-hidden text-ellipsis">
											@{mii.user?.username}
										</Link>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<p className="text-xl text-center mt-10">No results found.</p>
			)}
		</div>
	);
}
