import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@tomodachi-share/shared/schemas";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id: slugId } = await params;
	const parsed = idSchema.safeParse(slugId);
	if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
	const userId = parsed.data;

	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		include: {
			_count: {
				select: {
					likes: true,
				},
			},
		},
	});

	return NextResponse.json(user);
}
