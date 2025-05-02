import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

let bannerText: string | null = null;

export async function GET() {
	return NextResponse.json({ success: true, message: bannerText });
}

export async function POST(request: NextRequest) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	if (Number(session.user.id) !== Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const body = await request.text();
	bannerText = body;

	return NextResponse.json({ success: true });
}

export async function DELETE() {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	if (Number(session.user.id) !== Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	bannerText = null;
	return NextResponse.json({ success: true });
}
