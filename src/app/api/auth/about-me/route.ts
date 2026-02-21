import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { profanity } from "@2toad/profanity";
import z from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RateLimit } from "@/lib/rate-limit";

export async function PATCH(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	Sentry.setUser({ id: session.user.id, username: session.user.username });

	const rateLimit = new RateLimit(request, 3);
	const check = await rateLimit.handle();
	if (check) return check;

	const { description } = await request.json();
	if (!description) return rateLimit.sendResponse({ error: "New about me is required" }, 400);

	const validation = z.string().trim().max(256).safeParse(description);
	if (!validation.success) return rateLimit.sendResponse({ error: validation.error.issues[0].message }, 400);

	try {
		await prisma.user.update({
			where: { id: Number(session.user.id) },
			data: { description: profanity.censor(description) },
		});
	} catch (error) {
		console.error("Failed to update description:", error);
		Sentry.captureException(error, { extra: { stage: "update-about-me" } });
		return rateLimit.sendResponse({ error: "Failed to update description" }, 500);
	}

	return rateLimit.sendResponse({ success: true });
}
