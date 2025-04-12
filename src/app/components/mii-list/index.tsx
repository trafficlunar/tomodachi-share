import Link from "next/link";
import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import SortSelect from "./sort-select";
import Carousel from "../carousel";
import LikeButton from "../like-button";
import FilterSelect from "./filter-select";

interface Props {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
	// for use on profiles
	userId?: number;
	where?: Record<string, object>;
}

export default async function MiiList({ searchParams, userId, where }: Props) {
	const session = await auth();
	const resolvedSearchParams = await searchParams;

	// Sort search param
	// Defaults to newest
	const orderBy: Prisma.MiiOrderByWithRelationInput =
		resolvedSearchParams.sort === "newest"
			? { createdAt: "desc" }
			: resolvedSearchParams.sort === "likes"
			? { likedBy: { _count: "desc" } }
			: { createdAt: "desc" };

	// Tag search param
	const rawTags = resolvedSearchParams.tags;
	const tagFilter =
		typeof rawTags === "string"
			? rawTags
					.split(",")
					.map((tag) => tag.trim())
					.filter((tag) => tag.length > 0)
			: [];
	const whereTags = tagFilter.length > 0 ? { tags: { hasEvery: tagFilter } } : undefined;

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
			<div className="flex justify-between items-end mb-2 max-[32rem]:flex-col max-[32rem]:items-center">
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
					<FilterSelect />
					<SortSelect />
				</div>
			</div>

			{miis.length > 0 ? (
				<div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-sm:grid-cols-2 max-[25rem]:grid-cols-1">
					{formattedMiis.map((mii) => (
						<div
							key={mii.id}
							className="flex flex-col bg-zinc-50 rounded-3xl border-2 border-zinc-300 shadow-lg p-3 transition hover:scale-105 hover:bg-cyan-100 hover:border-cyan-600"
						>
							<Carousel
								images={[
									`/mii/${mii.id}/mii.webp`,
									`/mii/${mii.id}/qr-code.webp`,
									...Array.from({ length: mii.imageCount }, (_, index) => `/mii/${mii.id}/image${index}.webp`),
								]}
							/>

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
