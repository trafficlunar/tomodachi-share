import { NextRequest, NextResponse } from "next/server";

import dayjs from "dayjs";
import { profanity } from "@2toad/profanity";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { usernameSchema } from "@/lib/schemas";
import { RateLimit } from "@/lib/rate-limit";

export async function PATCH(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const rateLimit = new RateLimit(request, 1);
	const check = await rateLimit.handle();
	if (check) return check;

	const { username } = await request.json();
	if (!username) return rateLimit.sendResponse({ error: "New username is required" }, 400);

	// Check if username was updated in the last 90 days
	const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } });
	if (user && user.usernameUpdatedAt) {
		const timePeriod = dayjs().subtract(90, "days");
		const lastUpdate = dayjs(user.usernameUpdatedAt);

		if (lastUpdate.isAfter(timePeriod)) return rateLimit.sendResponse({ error: "Username was changed in the last 90 days" }, 400);
	}

	const validation = usernameSchema.safeParse(username);
	if (!validation.success) return rateLimit.sendResponse({ error: validation.error.errors[0].message }, 400);

	// Check for inappropriate words
	if (profanity.exists(username)) return rateLimit.sendResponse({ error: "Username contains inappropriate words" }, 400);

	const existingUser = await prisma.user.findUnique({ where: { username } });
	if (existingUser) return rateLimit.sendResponse({ error: "Username is already taken" }, 400);

	try {
		await prisma.user.update({
			where: { id: Number(session.user.id) },
			data: { username, usernameUpdatedAt: new Date() },
		});
	} catch (error) {
		console.error("Failed to update username:", error);
		return rateLimit.sendResponse({ error: "Failed to update username" }, 500);
	}

	return rateLimit.sendResponse({ success: true });
}
