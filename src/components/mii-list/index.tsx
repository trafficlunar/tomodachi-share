import Link from "next/link";

import { MiiGender, Prisma } from "@prisma/client";
import { Icon } from "@iconify/react";
import { z } from "zod";

import { querySchema } from "@/lib/schemas";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import GenderSelect from "./gender-select";
import TagFilter from "./tag-filter";
import SortSelect from "./sort-select";
import Carousel from "../carousel";
import LikeButton from "../like-button";
import DeleteMiiButton from "../delete-mii";
import Pagination from "./pagination";

interface Props {
	searchParams: { [key: string]: string | string[] | undefined };
	userId?: number; // Profiles
	inLikesPage?: boolean; // Self-explanatory
}

const searchSchema = z.object({
	q: querySchema.optional(),
	sort: z.enum(["newest", "likes", "oldest"], { message: "Sort must be either 'newest', 'likes', or 'oldest'" }).default("newest"),
	tags: z
		.string()
		.optional()
		.transform((value) =>
			value
				?.split(",")
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0)
		),
	gender: z.enum(MiiGender, { error: "Gender must be either 'MALE', or 'FEMALE'" }).optional(),
	// todo: incorporate tagsSchema
	// Pages
	limit: z.coerce
		.number({ error: "Limit must be a number" })
		.int({ error: "Limit must be an integer" })
		.min(1, { error: "Limit must be at least 1" })
		.max(100, { error: "Limit cannot be more than 100" })
		.optional(),
	page: z.coerce
		.number({ error: "Page must be a number" })
		.int({ error: "Page must be an integer" })
		.min(1, { error: "Page must be at least 1" })
		.optional(),
});

export default async function MiiList({ searchParams, userId, inLikesPage }: Props) {
	const session = await auth();

	const parsed = searchSchema.safeParse(searchParams);
	if (!parsed.success) return <h1>{parsed.error.issues[0].message}</h1>;

	const { q: query, sort, tags, gender, page = 1, limit = 24 } = parsed.data;

	// My Likes page
	let miiIdsLiked: number[] | undefined = undefined;

	if (inLikesPage && session?.user.id) {
		const likedMiis = await prisma.like.findMany({
			where: { userId: Number(session.user.id) },
			select: { miiId: true },
		});
		miiIdsLiked = likedMiis.map((like) => like.miiId);
	}

	const where: Prisma.MiiWhereInput = {
		// Only show liked miis on likes page
		...(inLikesPage && miiIdsLiked && { id: { in: miiIdsLiked } }),
		// Searching
		...(query && {
			OR: [{ name: { contains: query, mode: "insensitive" } }, { tags: { has: query } }],
		}),
		// Tag filtering
		...(tags && tags.length > 0 && { tags: { hasEvery: tags } }),
		// Gender
		...(gender && { gender: { equals: gender } }),
		// Profiles
		...(userId && { userId }),
	};

	// Sorting by likes, newest, or oldest
	let orderBy: Prisma.MiiOrderByWithRelationInput[];

	if (sort === "likes") {
		orderBy = [{ likedBy: { _count: "desc" } }, { name: "asc" }];
	} else if (sort === "oldest") {
		orderBy = [{ createdAt: "asc" }, { name: "asc" }];
	} else {
		// default to newest
		orderBy = [{ createdAt: "desc" }, { name: "asc" }];
	}

	const select: Prisma.MiiSelect = {
		id: true,
		// Don't show when userId is specified
		...(!userId && {
			user: {
				select: {
					id: true,
					username: true,
				},
			},
		}),
		name: true,
		imageCount: true,
		tags: true,
		createdAt: true,
		// Mii liked check
		...(session?.user?.id && {
			likedBy: {
				where: { userId: Number(session.user.id) },
				select: { userId: true },
			},
		}),
		// Like count
		_count: {
			select: { likedBy: true },
		},
	};

	const skip = (page - 1) * limit;

	const [totalCount, filteredCount, list] = await Promise.all([
		prisma.mii.count({ where: { ...where, userId } }),
		prisma.mii.count({ where, skip, take: limit }),
		prisma.mii.findMany({ where, orderBy, select, skip: (page - 1) * limit, take: limit }),
	]);

	const lastPage = Math.ceil(totalCount / limit);
	const miis = list.map(({ _count, likedBy, ...rest }) => ({
		...rest,
		likes: _count.likedBy,
		isLiked: session?.user?.id ? likedBy.length > 0 : false,
	}));

	return (
		<div className="w-full">
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex justify-between items-center gap-2 mb-2 max-[56rem]:flex-col">
				<div className="flex items-center gap-2">
					{totalCount == filteredCount ? (
						<>
							<span className="text-2xl font-bold text-amber-900">{totalCount}</span>
							<span className="text-lg text-amber-700">{totalCount === 1 ? "Mii" : "Miis"}</span>
						</>
					) : (
						<>
							<span className="text-2xl font-bold text-amber-900">{filteredCount}</span>
							<span className="text-sm text-amber-700">of</span>
							<span className="text-lg font-semibold text-amber-800">{totalCount}</span>
							<span className="text-lg text-amber-700">Miis</span>
						</>
					)}
				</div>

				<div className="flex items-center justify-end gap-2 w-full min-[56rem]:max-w-2/3 max-[56rem]:justify-center max-sm:flex-col">
					<GenderSelect />
					<TagFilter />
					<SortSelect />
				</div>
			</div>

			<div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-[30rem]:grid-cols-1">
				{miis.map((mii) => (
					<div
						key={mii.id}
						className="flex flex-col bg-zinc-50 rounded-3xl border-2 border-zinc-300 shadow-lg p-[0.8rem] transition hover:scale-105 hover:bg-cyan-100 hover:border-cyan-600"
					>
						<Carousel
							images={[
								`/mii/${mii.id}/image?type=mii`,
								`/mii/${mii.id}/image?type=qr-code`,
								...Array.from({ length: mii.imageCount }, (_, index) => `/mii/${mii.id}/image?type=image${index}`),
							]}
						/>

						<div className="p-4 flex flex-col gap-1 h-full">
							<Link href={`/mii/${mii.id}`} className="font-bold text-2xl line-clamp-1" title={mii.name}>
								{mii.name}
							</Link>
							<div id="tags" className="flex flex-wrap gap-1">
								{mii.tags.map((tag) => (
									<Link href={{ query: { tags: tag } }} key={tag} className="px-2 py-1 bg-orange-300 rounded-full text-xs">
										{tag}
									</Link>
								))}
							</div>

							<div className="mt-auto grid grid-cols-2 items-center">
								<LikeButton likes={mii.likes} miiId={mii.id} isLiked={mii.isLiked} isLoggedIn={session?.user != null} abbreviate />

								{!userId && (
									<Link href={`/profile/${mii.user?.id}`} className="text-sm text-right overflow-hidden text-ellipsis">
										@{mii.user?.username}
									</Link>
								)}

								{userId && Number(session?.user.id) == userId && (
									<div className="flex gap-1 text-2xl justify-end text-zinc-400">
										<Link href={`/edit/${mii.id}`} title="Edit Mii" aria-label="Edit Mii" data-tooltip="Edit">
											<Icon icon="mdi:pencil" />
										</Link>
										<DeleteMiiButton miiId={mii.id} miiName={mii.name} likes={mii.likes} />
									</div>
								)}
							</div>
						</div>
					</div>
				))}
			</div>

			<Pagination lastPage={lastPage} />
		</div>
	);
}
