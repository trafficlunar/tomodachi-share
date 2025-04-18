import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { displayNameSchema } from "@/lib/schemas";

export async function PATCH(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { displayName } = await request.json();
	if (!displayName) return NextResponse.json({ error: "New display name is required" }, { status: 400 });

	const validation = displayNameSchema.safeParse(displayName);
	if (!validation.success) return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });

	try {
		await prisma.user.update({
			where: { email: session.user?.email ?? undefined },
			data: { name: displayName },
		});
	} catch (error) {
		console.error("Failed to update display name:", error);
		return NextResponse.json({ error: "Failed to update display name" }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
