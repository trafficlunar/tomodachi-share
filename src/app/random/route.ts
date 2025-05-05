import { NextRequest } from "next/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { RateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
	const rateLimit = new RateLimit(request, 20);
	const check = await rateLimit.handle();
	if (check) return check;

	const count = await prisma.mii.count();
	if (count === 0) redirect("/");

	const randomIndex = Math.floor(Math.random() * count);
	const randomMii = await prisma.mii.findFirst({
		skip: randomIndex,
		take: 1,
		select: { id: true },
	});

	if (!randomMii) redirect("/");

	redirect(`/mii/${randomMii.id}`);
}
