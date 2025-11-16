import { NextRequest } from "next/server";

import crypto from "crypto";
import seedrandom from "seedrandom";

import { searchSchema } from "@/lib/schemas";
import { RateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
	const rateLimit = new RateLimit(request, 24, "/api/search");
	const check = await rateLimit.handle();
	if (check) return check;

	const parsed = searchSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.issues[0].message }, 400);

	const { q: query, sort, tags, gender, page = 1, limit = 24, seed } = parsed.data;

	const where: Prisma.MiiWhereInput = {
		// Searching
		...(query && {
			OR: [{ name: { contains: query, mode: "insensitive" } }, { tags: { has: query } }, { description: { contains: query, mode: "insensitive" } }],
		}),
		// Tag filtering
		...(tags && tags.length > 0 && { tags: { hasEvery: tags } }),
		// Gender
		...(gender && { gender: { equals: gender } }),
	};

	const select: Prisma.MiiSelect = {
		id: true,
		name: true,
		imageCount: true,
		tags: true,
		createdAt: true,
		gender: true,
		// Like count
		_count: {
			select: { likedBy: true },
		},
	};

	const skip = (page - 1) * limit;

	if (sort === "random") {
		// Use seed for consistent random results
		const randomSeed = seed || crypto.randomInt(0, 1_000_000_000);

		// Get all IDs that match the where conditions
		const matchingIds = await prisma.mii.findMany({
			where,
			select: { id: true },
		});

		if (matchingIds.length === 0) return;

		const rng = seedrandom(randomSeed.toString());

		// Randomize all IDs using the Durstenfeld algorithm
		for (let i = matchingIds.length - 1; i > 0; i--) {
			const j = Math.floor(rng() * (i + 1));
			[matchingIds[i], matchingIds[j]] = [matchingIds[j], matchingIds[i]];
		}

		// Convert to number[] array and return paginated results
		return rateLimit.sendResponse(matchingIds.slice(skip, skip + limit).map((i) => i.id));
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

		const list = await prisma.mii.findMany({
			where,
			orderBy,
			select: { id: true },
			skip,
			take: limit,
		});

		return rateLimit.sendResponse(list.map((mii) => mii.id));
	}
}
