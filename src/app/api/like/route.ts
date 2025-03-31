import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
	// todo: rate limit

	const session = await auth();
	if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

	const { miiId } = await request.json();
	if (!miiId) return Response.json({ error: "Mii ID is required" }, { status: 400 });

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

	return Response.json({ success: true, liked: result.liked, count: result.count });
}
