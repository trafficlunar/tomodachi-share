import { NextRequest, NextResponse } from "next/server";
import { profanity } from "@2toad/profanity";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userNameSchema } from "@tomodachi-share/shared/schemas";
import { RateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
	const session = await auth();
	if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
		return rateLimit.sendResponse({ error: "Failed to update name" }, 500);
	}

	// Tell Cloudflare to purge cache
	fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`, {
		method: "POST",
		headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, "Content-Type": "application/json" },
		body: JSON.stringify({
			files: [`${process.env.NEXT_PUBLIC_BASE_URL}/api/profile/${session.user.id}/info`],
		}),
	});

	return rateLimit.sendResponse({ success: true });
}
