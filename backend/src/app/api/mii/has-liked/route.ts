import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const rateLimit = new RateLimit(request, 50, "/api/mii/like_get");
	const check = await rateLimit.handle();
	if (check) return check;

	const idsParam = new URL(request.url).searchParams.get("ids");
	if (!idsParam) return NextResponse.json({ error: "Missing IDs parameter" }, { status: 400 });

	const ids = idsParam.split(",").map(Number).filter(Boolean);
	if (!ids.length) return NextResponse.json({ error: "No valid IDs provided" }, { status: 400 });
	if (ids.length > 100) return NextResponse.json({ error: "Too many IDs, maximum is 100" }, { status: 400 });

	const liked = await prisma.like.findMany({
		where: { userId: Number(session.user?.id), miiId: { in: ids } },
		select: { miiId: true },
	});

	// Return only Miis that are liked
	return NextResponse.json(liked.map((l) => l.miiId));
}
