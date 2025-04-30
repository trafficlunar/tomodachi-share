import { NextRequest, NextResponse } from "next/server";

import fs from "fs/promises";
import path from "path";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/lib/schemas";
import { RateLimit } from "@/lib/rate-limit";

const uploadsDirectory = path.join(process.cwd(), "public", "mii");

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const rateLimit = new RateLimit(request, 10);
	const check = await rateLimit.handle();
	if (check) return check;

	const { id: slugId } = await params;
	const parsed = idSchema.safeParse(slugId);
	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.errors[0].message }, 400);
	const miiId = parsed.data;

	const miiUploadsDirectory = path.join(uploadsDirectory, miiId.toString());

	try {
		await prisma.mii.delete({
			where: { id: miiId },
		});
	} catch (error) {
		console.error("Failed to delete Mii from database:", error);
		return rateLimit.sendResponse({ error: "Failed to delete Mii" }, 500);
	}

	try {
		await fs.rm(miiUploadsDirectory, { recursive: true, force: true });
	} catch (error) {
		console.warn("Failed to delete Mii image files:", error);
	}

	return rateLimit.sendResponse({ success: true });
}
