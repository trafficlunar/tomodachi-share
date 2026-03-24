import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { profanity } from "@2toad/profanity";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userNameSchema } from "@/lib/schemas";
import { RateLimit } from "@/lib/rate-limit";

export async function PATCH(request: NextRequest) {
	const session = await auth();
	if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	Sentry.setUser({ id: session.user.id, name: session.user.name });

	const rateLimit = new RateLimit(request, 3);
	const check = await rateLimit.handle();
	if (check) return check;

	const { name } = await request.json();
	if (!name) return rateLimit.sendResponse({ error: "New name is required" }, 400);

	const validation = userNameSchema.safeParse(name);
	if (!validation.success) return rateLimit.sendResponse({ error: validation.error.issues[0].message }, 400);

	// Check for inappropriate words
	if (profanity.exists(name)) return rateLimit.sendResponse({ error: "Name contains inappropriate words" }, 400);

	try {
		await prisma.user.update({
			where: { id: Number(session.user.id) },
			data: { name },
		});
	} catch (error) {
		console.error("Failed to update name:", error);
		Sentry.captureException(error, { extra: { stage: "update-name" } });
		return rateLimit.sendResponse({ error: "Failed to update name" }, 500);
	}

	return rateLimit.sendResponse({ success: true });
}
