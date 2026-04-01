import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/lib/schemas";

export async function PATCH(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	if (Number(session.user?.id) !== Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const searchParams = request.nextUrl.searchParams;
	const parsedMiiId = idSchema.safeParse(searchParams.get("id"));

	if (!parsedMiiId.success) return NextResponse.json({ error: parsedMiiId.error.issues[0].message }, { status: 400 });
	const miiId = parsedMiiId.data;

	await prisma.mii.update({
		where: {
			id: miiId,
		},
		data: {
			in_queue: false,
		},
	});

	return NextResponse.json({ success: true });
}
