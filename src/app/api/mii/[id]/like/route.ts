import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/lib/schemas";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id: slugId } = await params;
	const parsed = idSchema.safeParse(slugId);

	if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
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

	return NextResponse.json({ success: true, liked: result.liked, count: result.count });
}
