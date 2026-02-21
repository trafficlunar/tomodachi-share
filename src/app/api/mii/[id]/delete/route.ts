import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

import fs from "fs/promises";
import path from "path";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/lib/schemas";
import { RateLimit } from "@/lib/rate-limit";

const uploadsDirectory = path.join(process.cwd(), "uploads", "mii");

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	Sentry.setUser({ id: session.user.id, username: session.user.username });

	const rateLimit = new RateLimit(request, 30, "/api/mii/delete");
	const check = await rateLimit.handle();
	if (check) return check;

	const { id: slugId } = await params;
	const parsed = idSchema.safeParse(slugId);
	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.issues[0].message }, 400);
	const miiId = parsed.data;

	// Check ownership of Mii
	const mii = await prisma.mii.findUnique({
		where: {
			id: miiId,
		},
	});

	if (!mii) return rateLimit.sendResponse({ error: "Mii not found" }, 404);
	if (!(Number(session.user.id) === mii.userId || Number(session.user.id) === Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID)))
		return rateLimit.sendResponse({ error: "You don't have ownership of that Mii" }, 403);

	const miiUploadsDirectory = path.join(uploadsDirectory, miiId.toString());

	try {
		await prisma.mii.delete({
			where: { id: miiId },
		});
	} catch (error) {
		console.error("Failed to delete Mii from database:", error);
		Sentry.captureException(error, { extra: { stage: "delete-mii" } });
		return rateLimit.sendResponse({ error: "Failed to delete Mii" }, 500);
	}

	try {
		await fs.rm(miiUploadsDirectory, { recursive: true, force: true });
	} catch (error) {
		console.warn("Failed to delete Mii image files:", error);
		Sentry.captureException(error, { extra: { stage: "delete-mii-images" } });
	}

	return rateLimit.sendResponse({ success: true });
}
