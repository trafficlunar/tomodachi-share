import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { usernameSchema } from "@/lib/schemas";
import dayjs from "dayjs";

export async function PATCH(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { username } = await request.json();
	if (!username) return NextResponse.json({ error: "New username is required" }, { status: 400 });

	// Check if username was updated in the last 90 days
	const user = await prisma.user.findUnique({ where: { email: session.user?.email ?? undefined } });
	if (user && user.usernameUpdatedAt) {
		const timePeriod = dayjs().subtract(90, "days");
		const lastUpdate = dayjs(user.usernameUpdatedAt);

		if (lastUpdate.isAfter(timePeriod)) return NextResponse.json({ error: "Username was changed in the last 90 days" }, { status: 400 });
	}

	const validation = usernameSchema.safeParse(username);
	if (!validation.success) return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });

	const existingUser = await prisma.user.findUnique({ where: { username } });
	if (existingUser) return NextResponse.json({ error: "Username is already taken" }, { status: 400 });

	try {
		await prisma.user.update({
			where: { email: session.user?.email ?? undefined },
			data: { username, usernameUpdatedAt: new Date() },
		});
	} catch (error) {
		console.error("Failed to update username:", error);
		return NextResponse.json({ error: "Failed to update username" }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
