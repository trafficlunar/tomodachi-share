import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import fs from "fs/promises";
import path from "path";

import { idSchema } from "@/lib/schemas";
import { RateLimit } from "@/lib/rate-limit";

const searchParamsSchema = z.object({
	type: z
		.enum(["mii", "qr-code", "image0", "image1", "image2"], {
			message: "Image type must be either 'mii', 'qr-code' or 'image[number from 0 to 2]'",
		})
		.default("mii"),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const rateLimit = new RateLimit(request, 200);
	const check = await rateLimit.handle();
	if (check) return check;

	const { id: slugId } = await params;
	const parsed = idSchema.safeParse(slugId);
	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.errors[0].message }, 400);
	const miiId = parsed.data;

	const searchParamsParsed = searchParamsSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
	if (!searchParamsParsed.success) return rateLimit.sendResponse({ error: searchParamsParsed.error.errors[0].message }, 400);
	const { type: imageType } = searchParamsParsed.data;

	const filePath = path.join(process.cwd(), "uploads", miiId.toString(), `${imageType}.webp`);

	try {
		const buffer = await fs.readFile(filePath);
		return new NextResponse(buffer);
	} catch {
		return rateLimit.sendResponse({ error: "Image not found" }, 404);
	}
}
