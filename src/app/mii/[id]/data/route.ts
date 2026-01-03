import { NextRequest } from "next/server";

import { idSchema } from "@/lib/schemas";
import { RateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const rateLimit = new RateLimit(request, 3, "/mii/data");
	const check = await rateLimit.handle();
	if (check) return check;

	const { id: slugId } = await params;
	const parsed = idSchema.safeParse(slugId);
	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.issues[0].message }, 400);
	const miiId = parsed.data;

	const data = await prisma.mii.findUnique({
		where: { id: miiId },
		select: {
			id: true,
			name: true,
			_count: {
				select: {
					likedBy: true,
				},
			},
			platform: true,
			imageCount: true,
			tags: true,
			description: true,
			firstName: true,
			lastName: true,
			gender: true,
			islandName: true,
			allowedCopying: true,
			createdAt: true,
			user: { select: { id: true, username: true, name: true } },
		},
	});

	if (!data) {
		return rateLimit.sendResponse({ error: "Mii not found" }, 404);
	}

	const { _count, ...rest } = data;
	return rateLimit.sendResponse({
		...rest,
		likes: _count.likedBy,
	});
}
