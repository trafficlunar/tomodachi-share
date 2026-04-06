import { Prisma } from "@prisma/client";

import crypto from "crypto";
import seedrandom from "seedrandom";

import { searchSchema } from "@/lib/schemas";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import SortSelect from "./sort-select";
import Pagination from "./pagination";
import FilterMenu from "./filter-menu";
import MiiGrid from "./mii-grid";

interface Props {
	searchParams: { [key: string]: string | string[] | undefined };
	userId?: number; // Profiles
	parentPage?: "likes" | "admin";
}

export default async function MiiList({ searchParams, userId, parentPage }: Props) {
	const session = await auth();
	const parsed = searchSchema.safeParse(searchParams);
	if (!parsed.success) return <h1>{parsed.error.issues[0].message}</h1>;

	const { q: query, sort, tags, exclude, platform, gender, makeup, allowCopying, quarantined, page = 1, limit = 24, seed } = parsed.data;

	// My Likes page
	let miiIdsLiked: number[] | undefined = undefined;

	if (parentPage === "likes" && session?.user?.id) {
		const likedMiis = await prisma.like.findMany({
			where: { userId: Number(session.user.id) },
			select: { miiId: true },
		});
		miiIdsLiked = likedMiis.map((like) => like.miiId);
	}

	const where: Prisma.MiiWhereInput = {
		// In queue logic
		...(parentPage === "admin"
			? { in_queue: true } // Only show queued Miis
			: userId
				? {
						// Include queued Miis if user is on their profile
						...(Number(session?.user?.id) === userId ? {} : { in_queue: false }),
						userId,
					}
				: {
						// Don't show queued Miis on main page
						in_queue: false,
					}),
		// Only show liked miis on likes page
		...(parentPage === "likes" && miiIdsLiked && { id: { in: miiIdsLiked } }),
		// Searching
		...(query && {
			OR: [{ name: { contains: query, mode: "insensitive" } }, { tags: { has: query } }, { description: { contains: query, mode: "insensitive" } }],
		}),
		// Tag filtering
		...(tags && tags.length > 0 && { tags: { hasEvery: tags } }),
		...(exclude && exclude.length > 0 && { NOT: { tags: { hasSome: exclude } } }),
		// Platform
		...(platform && { platform: { equals: platform } }),
		// Gender
		...(gender && { gender: { equals: gender } }),
		// Allow Copying
		...(allowCopying && { allowedCopying: true }),
		// Makeup
		...(makeup && { makeup: { equals: makeup } }),
		// Quarantined
		...(!quarantined && !userId && { quarantined: false }),
	};

	const select: Prisma.MiiSelect = {
		id: true,
		// Don't show when userId is specified
		...(!userId && {
			user: {
				select: {
					id: true,
					name: true,
				},
			},
		}),
		platform: true,
		name: true,
		imageCount: true,
		tags: true,
		createdAt: true,
		gender: true,
		makeup: true,
		allowedCopying: true,
		quarantined: true,
		in_queue: true,
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

	let totalCount: number;
	let filteredCount: number;
	let miis: Prisma.MiiGetPayload<{ select: typeof select }>[];

	if (sort === "random") {
		// Get all IDs that match the where conditions
		const matchingIds = await prisma.mii.findMany({
			where,
			select: { id: true },
		});

		totalCount = matchingIds.length;
		filteredCount = Math.max(0, Math.min(limit, totalCount - skip));

		if (matchingIds.length === 0) return;

		// Use seed for consistent random results
		const randomSeed = seed || crypto.randomInt(0, 1_000_000_000);
		const rng = seedrandom(randomSeed.toString());

		// Randomize all IDs using the Durstenfeld algorithm
		for (let i = matchingIds.length - 1; i > 0; i--) {
			const j = Math.floor(rng() * (i + 1));
			[matchingIds[i], matchingIds[j]] = [matchingIds[j], matchingIds[i]];
		}

		// Convert to number[] array
		const selectedIds = matchingIds.slice(skip, skip + limit).map((i) => i.id);

		miis = await prisma.mii.findMany({
			where: {
				id: { in: selectedIds },
			},
			select,
		});
	} else {
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

		[totalCount, filteredCount, miis] = await Promise.all([
			prisma.mii.count({ where: { ...where, userId } }),
			prisma.mii.count({ where, skip, take: limit }),
			prisma.mii.findMany({
				where,
				orderBy,
				select,
				skip: (page - 1) * limit,
				take: limit,
			}),
		]);
	}

	const lastPage = Math.ceil(totalCount / limit);

	return (
		<div className="w-full">
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex justify-between items-center gap-2 mb-2 max-md:flex-col">
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

				<div className="relative flex items-center justify-end gap-2 w-full md:max-w-2/3 max-md:justify-center">
					<FilterMenu />
					<SortSelect />
				</div>
			</div>

			<MiiGrid miis={miis} userId={userId} parentPage={parentPage} />
			<Pagination lastPage={lastPage} />
		</div>
	);
}
