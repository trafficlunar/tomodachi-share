import { NextRequest, NextResponse } from "next/server";
import { profanity } from "@2toad/profanity";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { displayNameSchema } from "@/lib/schemas";
import { RateLimit } from "@/lib/rate-limit";

export async function PATCH(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const rateLimit = new RateLimit(request, 1);
	const check = await rateLimit.handle();
	if (check) return check;

	const { displayName } = await request.json();
	if (!displayName) return rateLimit.sendResponse({ error: "New display name is required" }, 400);

	const validation = displayNameSchema.safeParse(displayName);
	if (!validation.success) return rateLimit.sendResponse({ error: validation.error.errors[0].message }, 400);

	// Check for inappropriate words
	if (profanity.exists(displayName)) return rateLimit.sendResponse({ error: "Display name contains inappropriate words" }, 400);

	try {
		await prisma.user.update({
			where: { id: Number(session.user.id) },
			data: { name: displayName },
		});
	} catch (error) {
		console.error("Failed to update display name:", error);
		return rateLimit.sendResponse({ error: "Failed to update display name" }, 500);
	}

	return rateLimit.sendResponse({ success: true });
}
