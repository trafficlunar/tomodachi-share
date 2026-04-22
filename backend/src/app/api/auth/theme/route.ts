import { NextRequest, NextResponse } from "next/server";
import z from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RateLimit } from "@/lib/rate-limit";

const themeSchema = z.enum(["LIGHT", "DARK", "SYSTEM"]);

export async function GET(request: NextRequest) {
	const session = await auth();
	if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	try {
		const user = await prisma.user.findUnique({
			where: { id: Number(session.user.id) },
			select: { theme: true },
		});

		if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

		return NextResponse.json({ theme: user.theme });
	} catch (error) {
		console.error("Failed to get theme:", error);
		return NextResponse.json({ error: "Failed to get theme" }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	const session = await auth();
	if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const rateLimit = new RateLimit(request, 5);
	const check = await rateLimit.handle();
	if (check) return check;

	const { theme } = await request.json();

	const validation = themeSchema.safeParse(theme);
	if (!validation.success) return rateLimit.sendResponse({ error: "Invalid theme value" }, 400);

	try {
		await prisma.user.update({
			where: { id: Number(session.user.id) },
			data: { theme: validation.data },
		});
	} catch (error) {
		console.error("Failed to update theme:", error);
		return rateLimit.sendResponse({ error: "Failed to update theme" }, 500);
	}

	return rateLimit.sendResponse({ success: true });
}
