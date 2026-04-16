import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@tomodachi-share/shared/schemas";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth();
	const { id: slugId } = await params;
	const parsed = idSchema.safeParse(slugId);
	if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
	const miiId = parsed.data;

	const mii = await prisma.mii.findUnique({
		where: {
			id: miiId,
		},
		include: {
			user: {
				select: {
					name: true,
				},
			},
			likedBy: session?.user
				? {
						where: {
							userId: Number(session.user.id),
						},
						select: { userId: true },
					}
				: false,
			_count: {
				select: { likedBy: true }, // Get total like count
			},
		},
	});

	return NextResponse.json(mii);
}
