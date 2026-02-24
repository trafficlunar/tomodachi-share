import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";
import dayjs from "dayjs";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/lib/schemas";
import { PunishmentType } from "@prisma/client";

const punishSchema = z.object({
	type: z.enum([PunishmentType.WARNING, PunishmentType.TEMP_EXILE, PunishmentType.PERM_EXILE]),
	duration: z
		.number({ error: "Duration (days) must be a number" })
		.int({ error: "Duration (days) must be an integer" })
		.positive({ error: "Duration (days) must be valid" }),
	notes: z.string(),
	reasons: z.array(z.string()).optional(),
	miiReasons: z
		.array(
			z.object({
				id: z.number({ error: "Mii ID must be a number" }).int({ error: "Mii ID must be an integer" }).positive({ error: "Mii ID must be valid" }),
				reason: z.string(),
			}),
		)
		.optional(),
});

export async function POST(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	if (Number(session.user.id) !== Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const searchParams = request.nextUrl.searchParams;
	const parsedUserId = idSchema.safeParse(searchParams.get("id"));

	if (!parsedUserId.success) return NextResponse.json({ error: parsedUserId.error.issues[0].message }, { status: 400 });
	const userId = parsedUserId.data;

	const body = await request.json();
	const parsed = punishSchema.safeParse(body);

	if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
	const { type, duration, notes, reasons, miiReasons } = parsed.data;

	const expiresAt = type === "TEMP_EXILE" ? dayjs().add(duration, "days").toDate() : null;

	await prisma.punishment.create({
		data: {
			userId,
			type: type as PunishmentType,
			expiresAt,
			notes,
			reasons: reasons?.length !== 0 ? reasons : [],
			violatingMiis: {
				create: miiReasons?.map((mii) => ({
					miiId: mii.id,
					reason: mii.reason,
				})),
			},
		},
	});

	return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	if (Number(session.user.id) !== Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const searchParams = request.nextUrl.searchParams;
	const parsedPunishmentId = idSchema.safeParse(searchParams.get("id"));

	if (!parsedPunishmentId.success) return NextResponse.json({ error: parsedPunishmentId.error.issues[0].message }, { status: 400 });
	const punishmentId = parsedPunishmentId.data;

	await prisma.punishment.delete({
		where: {
			id: punishmentId,
		},
	});

	return NextResponse.json({ success: true });
}
