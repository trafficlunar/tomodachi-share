import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RateLimit } from "@/lib/rate-limit";
import { idSchema } from "@/lib/schemas";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	const rateLimit = new RateLimit(request, 200, "/mii/image");
	const check = await rateLimit.handle();
	if (check) return check;

	const { id: slugId } = await params;
	const parsed = idSchema.safeParse(slugId);
	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.issues[0].message }, 400);
	const miiId = parsed.data;

	const mii = await prisma.mii.findUnique({
		where: { id: miiId },
	});

	if (!mii || !mii.miiData) {
		return new NextResponse("Not found", { status: 404 });
	}

	const fileName = `${mii.name}.ltd`;

	return new NextResponse(mii.miiData, {
		headers: {
			"Content-Type": "application/octet-stream",
			"Content-Disposition": `attachment; filename="${fileName}"`,
		},
	});
}
