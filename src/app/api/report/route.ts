import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ReportReason, ReportType } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RateLimit } from "@/lib/rate-limit";
import { MiiWithUsername } from "@/types";

const reportSchema = z.object({
	id: z.coerce.number({ error: "ID must be a number" }).int({ error: "ID must be an integer" }).positive({ error: "ID must be valid" }),
	type: z.enum(["mii", "user"], { error: "Type must be either 'mii' or 'user'" }),
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

	if (!parsed.success) return rateLimit.sendResponse({ error: parsed.error.issues[0].message }, 400);
	const { id, type, reason, notes } = parsed.data;

	let mii: MiiWithUsername | null = null;

	// Check if the Mii or User exists
	if (type === "mii") {
		mii = await prisma.mii.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						username: true,
					},
				},
			},
		});
		if (!mii) return rateLimit.sendResponse({ error: "Mii not found" }, 404);
	} else {
		const user = await prisma.user.findUnique({
			where: { id },
		});
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
				creatorId: mii ? mii.userId : undefined,
			},
		});
	} catch (error) {
		console.error("Report creation failed", error);
		return rateLimit.sendResponse({ error: "Failed to create report" }, 500);
	}

	// Send notification to ntfy
	if (process.env.NTFY_URL) {
		// This is only shown if report type is MII
		const miiCreatorMessage = mii ? `by @${mii.user.username} (ID: ${mii.userId})` : "";

		await fetch(process.env.NTFY_URL, {
			method: "POST",
			body: `Report by @${session.user.username} (ID: ${session.user.id}) on ${type.toUpperCase()} (ID: ${id}) ${miiCreatorMessage}`,
			headers: {
				Title: "Report recieved - TomodachiShare",
				Priority: "urgent",
				Tags: "triangular_flag_on_post",
			},
		});
	}

	return rateLimit.sendResponse({ success: true });
}
