import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { RateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const rateLimit = new RateLimit(request, 1);
	const check = await rateLimit.handle();
	if (check) return check;

	const activePunishment = await prisma.punishment.findFirst({
		where: {
			userId: Number(session.user.id),
			returned: false,
		},
		include: {
			violatingMiis: {
				include: {
					mii: {
						select: {
							name: true,
						},
					},
				},
			},
		},
	});

	if (!activePunishment) return rateLimit.sendResponse({ error: "You have no active punishments!" }, 404);
	if (activePunishment.type === "PERM_EXILE") return rateLimit.sendResponse({ error: "Your punishment is permanent" }, 403);
	if (activePunishment.type === "TEMP_EXILE" && activePunishment.expiresAt! > new Date())
		return rateLimit.sendResponse({ error: "Your punishment has not expired yet." }, 403);

	await prisma.punishment.update({
		where: {
			id: activePunishment.id,
		},
		data: {
			returned: true,
		},
	});

	return rateLimit.sendResponse({ success: true });
}
