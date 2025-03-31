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
			// Delete the like if it exists
			await tx.like.delete({
				where: {
					userId_miiId: {
						userId: Number(session.user.id),
						miiId,
					},
				},
			});

			const updatedMii = await tx.mii.update({
				where: { id: miiId },
				data: { likes: { decrement: 1 } },
				select: { likes: true },
			});

			return { liked: false, count: updatedMii.likes };
		} else {
			// Create a new like if it doesn't exist
			await tx.like.create({
				data: {
					userId: Number(session.user.id),
					miiId,
				},
			});

			const updatedMii = await tx.mii.update({
				where: { id: miiId },
				data: { likes: { increment: 1 } },
				select: { likes: true },
			});

			return { liked: true, count: updatedMii.likes };
		}
	});

	return Response.json({ success: true, liked: result.liked, count: result.count });
}
