import { NextRequest, NextResponse } from "next/server";

import fs from "fs/promises";
import path from "path";

import { idSchema } from "@/lib/schemas";
import { RateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const rateLimit = new RateLimit(request, 16, "/profile/picture");
	const check = await rateLimit.handle();
	if (check) return check;

	const { id: slugId } = await params;
	const parsed = idSchema.safeParse(slugId);
	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.issues[0].message }, 400);
	const userId = parsed.data;

	const filePath = path.join(process.cwd(), "uploads", "user", `${userId}.webp`);

	try {
		const buffer = await fs.readFile(filePath);
		return new NextResponse(buffer);
	} catch {
		return rateLimit.sendResponse({ error: "Image not found" }, 404);
	}
}
