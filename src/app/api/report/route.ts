import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ReportReason, ReportType } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RateLimit } from "@/lib/rate-limit";

const reportSchema = z.object({
	id: z.coerce.number({ message: "ID must be a number" }).int({ message: "ID must be an integer" }).positive({ message: "ID must be valid" }),
	type: z.enum(["mii", "user"], { message: "Type must be either 'mii' or 'user'" }),
	reason: z.enum(["inappropriate", "spam", "copyright", "other"], {
		message: "Reason must be either 'inappropriate', 'spam', 'copyright', or 'other'",
	}),
	notes: z.string().trim().max(256).optional(),
});

export async function POST(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const rateLimit = new RateLimit(request, 2);
	const check = await rateLimit.handle();
	if (check) return check;

	const body = await request.json();
	const parsed = reportSchema.safeParse(body);

	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.errors[0].message }, 400);
	const { id, type, reason, notes } = parsed.data;

	// Check if the Mii or User exists
	if (type === "mii") {
		const mii = await prisma.mii.findUnique({ where: { id } });
		if (!mii) return rateLimit.sendResponse({ error: "Mii not found" }, 404);
	} else {
		const user = await prisma.user.findUnique({ where: { id } });
		if (!user) return rateLimit.sendResponse({ error: "User not found" }, 404);
	}

	// Check if user creating the report has already reported the same target before
	const existing = await prisma.report.findFirst({
		where: {
			targetId: id,
			reportType: type.toUpperCase() as ReportType,
			authorId: Number(session.user.id),
		},
	});

	if (existing) return rateLimit.sendResponse({ error: "You have already reported this" }, 400);

	try {
		await prisma.report.create({
			data: {
				reportType: type.toUpperCase() as ReportType,
				targetId: id,
				reason: reason.toUpperCase() as ReportReason,
				reasonNotes: notes,
				authorId: Number(session.user.id),
			},
		});
	} catch (error) {
		console.error("Report creation failed", error);
		return rateLimit.sendResponse({ error: "Failed to create report" }, 500);
	}

	return rateLimit.sendResponse({ success: true });
}
