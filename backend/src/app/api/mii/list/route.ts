import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { searchSchema } from "@tomodachi-share/shared/schemas";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
	const session = await auth();
	const parsed = searchSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
	if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

	const {
		q: query,
		sort,
		tags,
		exclude,
		platform,
		gender,
		makeup,
		allowCopying,
		quarantined,
		isFromSaveFile,
		page = 1,
		limit = 24,
		parentPage,
		userId,
		timeRange,
	} = parsed.data;

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
						userId,
					}
				: {
						// Don't show queued Miis on main page
						in_queue: false,
						needsFixing: null,
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
		// Other
		...(platform && { platform: { equals: platform } }),
		...(gender && { gender: { equals: gender } }),
		...(allowCopying && { allowedCopying: true }),
		...(makeup && { makeup: { equals: makeup } }),
		...(!quarantined && !userId && { quarantined: false }),
		...(isFromSaveFile && { isFromSaveFile: true }),
		...(timeRange && {
			reviewedAt: {
				gte: new Date(Date.now() - { day: 86400000, week: 604800000, month: 2592000000, year: 31536000000 }[timeRange]),
			},
		}),
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
		needsFixing: true,
		likeCount: true,
		// Mii liked check
		...(session?.user?.id && {
			likedBy: {
				where: { userId: Number(session.user.id) },
				select: { userId: true },
			},
		}),
		// Admin
		...(parentPage === "admin" && {
			description: true,
		}),
	};

	let totalCount: number;
	let miis: Prisma.MiiGetPayload<{ select: typeof select }>[];

	// Sorting by likes, newest, or oldest
	let orderBy: Prisma.MiiOrderByWithRelationInput[];

	if (sort === "likes") {
		orderBy = [{ likeCount: "desc" }, { name: "asc" }];
	} else if (sort === "oldest") {
		orderBy = [{ createdAt: "asc" }, { name: "asc" }];
	} else {
		// default to newest
		orderBy = [{ createdAt: "desc" }, { name: "asc" }];
	}

	[totalCount, miis] = await Promise.all([
		prisma.mii.count({ where: { ...where, userId } }),
		prisma.mii.findMany({
			where,
			orderBy,
			select,
			skip: (page - 1) * limit,
			take: limit,
		}),
	]);

	const lastPage = Math.ceil(totalCount / limit);

	return NextResponse.json({
		miis,
		totalCount,
		lastPage,
	});
}
