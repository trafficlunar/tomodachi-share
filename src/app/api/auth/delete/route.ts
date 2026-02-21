import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RateLimit } from "@/lib/rate-limit";

export async function DELETE(request: NextRequest) {
	const session = await auth();
	if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	Sentry.setUser({ id: session.user.id, username: session.user.username });

	const rateLimit = new RateLimit(request, 1);
	const check = await rateLimit.handle();
	if (check) return check;

	try {
		await prisma.user.delete({
			where: { id: Number(session.user.id) },
		});
	} catch (error) {
		console.error("Failed to delete user:", error);
		Sentry.captureException(error, { extra: { stage: "delete-account" } });
		return rateLimit.sendResponse({ error: "Failed to delete account" }, 500);
	}

	return rateLimit.sendResponse({ success: true });
}
