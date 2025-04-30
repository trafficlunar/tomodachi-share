import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/lib/schemas";
import { RateLimit } from "@/lib/rate-limit";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const rateLimit = new RateLimit(request, 100);
	const check = await rateLimit.handle();
	if (check) return check;

	const { id: slugId } = await params;
	const parsed = idSchema.safeParse(slugId);
	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.errors[0].message }, 400);
	const miiId = parsed.data;

	const result = await prisma.$transaction(async (tx) => {
		const existingLike = await tx.like.findUnique({
			where: {
				userId_miiId: {
					userId: Number(session.user.id),
					miiId,
				},
			},
		});

		if (existingLike) {
			// Remove the like if it exists
			await tx.like.delete({
				where: {
					userId_miiId: {
						userId: Number(session.user.id),
						miiId,
					},
				},
			});
		} else {
			// Add a like if it doesn't exist
			await tx.like.create({
				data: {
					userId: Number(session.user.id),
					miiId,
				},
			});
		}

		const likeCount = await tx.like.count({
			where: { miiId },
		});

		return { liked: !existingLike, count: likeCount };
	});

	return rateLimit.sendResponse({ success: true, liked: result.liked, count: result.count });
}
