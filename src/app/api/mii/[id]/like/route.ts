import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/lib/schemas";
import { RateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const rateLimit = new RateLimit(request, 100, "/api/mii/like");
	const check = await rateLimit.handle();
	if (check) return check;

	const { id: slugId } = await params;
	const parsed = idSchema.safeParse(slugId);
	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.issues[0].message }, 400);
	const miiId = parsed.data;

	const result = await prisma.$transaction(async (tx) => {
		const existingLike = await tx.like.findUnique({
			where: {
				userId_miiId: {
					userId: Number(session.user?.id),
					miiId,
				},
			},
		});

		if (existingLike) {
			await tx.like.delete({
				where: {
					userId_miiId: {
						userId: Number(session.user?.id),
						miiId,
					},
				},
			});
			await tx.mii.update({
				where: { id: miiId },
				data: { likeCount: { decrement: 1 } },
			});
		} else {
			await tx.like.create({
				data: {
					userId: Number(session.user?.id),
					miiId,
				},
			});
			await tx.mii.update({
				where: { id: miiId },
				data: { likeCount: { increment: 1 } },
			});
		}

		return { liked: !existingLike };
	});

	return rateLimit.sendResponse({ success: true, liked: result.liked });
}
