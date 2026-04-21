import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { RateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const rateLimit = new RateLimit(request, 30);
	const check = await rateLimit.handle();
	if (check) return check;

	const activePunishment = await prisma.punishment.findFirst({
		where: {
			userId: Number(session.user?.id),
			returned: false,
		},
	});

	if (!activePunishment) return rateLimit.sendResponse({ isPunished: false, punishment: null });
	return rateLimit.sendResponse({ isPunished: true, punishment: activePunishment });
}
