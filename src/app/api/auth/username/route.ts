import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const usernameSchema = z
	.string()
	.min(3, "Username must be at least 3 characters long")
	.max(20, "Username cannot be more than 20 characters long")
	.regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

export async function GET() {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	return NextResponse.json({ username: session.user.username });
}

export async function PATCH(request: Request) {
	const session = await auth();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { username } = await request.json();
	if (!username) return NextResponse.json({ error: "Username is required" }, { status: 400 });

	const validation = usernameSchema.safeParse(username);
	if (!validation.success) return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });

	const existingUser = await prisma.user.findUnique({ where: { username } });
	if (existingUser) return NextResponse.json({ error: "Username is already taken" }, { status: 400 });

	await prisma.user.update({
		where: { email: session.user?.email ?? undefined },
		data: { username },
	});

	return NextResponse.json({ success: true });
}
