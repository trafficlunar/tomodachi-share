import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
	const session = await auth();
	if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	try {
		await prisma.user.delete({
			where: { id: Number(session.user.id) },
		});
	} catch (error) {
		console.error("Failed to delete user:", error);
		return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
