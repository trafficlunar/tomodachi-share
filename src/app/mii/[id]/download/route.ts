import { NextRequest, NextResponse } from "next/server";

import fs from "fs/promises";
import path from "path";

import { prisma } from "@/lib/prisma";
import { RateLimit } from "@/lib/rate-limit";
import { idSchema } from "@/lib/schemas";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	const rateLimit = new RateLimit(request, 4, "/mii/download");
	const check = await rateLimit.handle();
	if (check) return check;

	const { id: slugId } = await params;
	const parsed = idSchema.safeParse(slugId);
	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.issues[0].message }, 400);
	const miiId = parsed.data;

	const mii = await prisma.mii.findUnique({
		where: { id: miiId },
	});
	if (!mii) return new NextResponse("Not found", { status: 404 });

	try {
		const buffer = await fs.readFile(path.join(process.cwd(), "uploads", "mii", miiId.toString(), "data.ltd"));
		return new NextResponse(buffer, {
			headers: {
				"Content-Type": "application/octet-stream",
				"Content-Disposition": `attachment; filename="${mii.name}.ltd"`,
			},
		});
	} catch {
		return rateLimit.sendResponse({ error: "File not found" }, 404);
	}
}
