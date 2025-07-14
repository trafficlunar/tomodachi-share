import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	if (Number(session.user.id) !== Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const searchParams = request.nextUrl.searchParams;
	const parsed = idSchema.safeParse(searchParams.get("id"));

	if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
	const userId = parsed.data;

	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		include: {
			punishments: {
				orderBy: {
					createdAt: "desc",
				},
				select: {
					id: true,
					type: true,
					returned: true,

					notes: true,
					reasons: true,
					violatingMiis: {
						select: {
							miiId: true,
							reason: true,
						},
					},

					expiresAt: true,
					createdAt: true,
				},
			},
		},
	});

	if (!user) return NextResponse.json({ error: "No user found" }, { status: 404 });

	return NextResponse.json({
		success: true,
		name: user.name,
		username: user.username,
		image: user.image,
		createdAt: user.createdAt,
		punishments: user.punishments,
	});
}
