import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { settings } from "@/lib/settings";

export async function GET() {
	return NextResponse.json({ success: true, value: settings.queueEnabled });
}

export async function PATCH(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	if (Number(session.user?.id) !== Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const body = await request.json();
	const validated = z.boolean().safeParse(body);
	if (!validated.success) return NextResponse.json({ error: "Failed to validate body" }, { status: 400 });

	settings.queueEnabled = validated.data;
	return NextResponse.json({ success: true });
}
