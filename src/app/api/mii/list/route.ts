import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nameSchema } from "@/lib/schemas";

const searchSchema = z.object({
	query: nameSchema.optional(),
	sort: z.enum(["newest", "likes"], { message: "Sort must be either 'newest' or 'likes'" }).default("newest"),
	tags: z
		.string()
		.optional()
		.transform((value) =>
			value
				?.split(",")
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0)
		),
	// todo: incorporate tagsSchema
	// Profiles
	userId: z.coerce
		.number({ message: "User ID must be a number" })
		.int({ message: "User ID must be an integer" })
		.positive({ message: "User ID must be valid" })
		.optional(),
	// Pages
	limit: z.coerce
		.number({ message: "Limit must be a number" })
		.int({ message: "Limit must be an integer" })
		.min(1, { message: "Limit must be at least 1" })
		.max(100, { message: "Limit cannot be more than 100" })
		.optional(),
	page: z.coerce
		.number({ message: "Page must be a number" })
		.int({ message: "Page must be an integer" })
		.min(1, { message: "Page must be at least 1" })
		.optional(),
});

export async function GET(request: NextRequest) {
	const session = await auth();

	const parsed = searchSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
	if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

	const { q: query, sort, tags, userId, page = 1, limit = 20 } = parsed.data;

	const where: Prisma.MiiWhereInput = {
		// Searching
		...(query && {
			OR: [{ name: { contains: query, mode: "insensitive" } }, { tags: { has: query } }],
		}),
		// Tag filtering
		...(tags && tags.length > 0 && { tags: { hasEvery: tags } }),
		// Profiles
		...(userId && { userId }),
	};

	// Sorting by likes or newest
	const orderBy: Prisma.MiiOrderByWithRelationInput = sort === "likes" ? { likedBy: { _count: "desc" } } : { createdAt: "desc" };

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
		likedBy: {
			where: session && session.user?.id ? { userId: Number(session.user.id) } : {},
			select: {
				userId: true,
			},
		},
		// Like count
		_count: {
			select: { likedBy: true },
		},
	};

	const skip = (page - 1) * limit;

	const [totalCount, filteredCount, list] = await Promise.all([
		prisma.mii.count({ where: userId ? { userId } : {} }),
		prisma.mii.count({ where, skip, take: limit }),
		prisma.mii.findMany({ where, orderBy, select, skip: (page - 1) * limit, take: limit }),
	]);

	return NextResponse.json({
		total: totalCount,
		filtered: filteredCount,
		miis: list.map(({ _count, likedBy, ...rest }) => ({
			...rest,
			likes: _count.likedBy,
			isLiked: likedBy.length > 0,
		})),
	});
}
