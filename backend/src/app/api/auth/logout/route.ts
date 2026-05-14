import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const session = await auth();

	if (session) {
		await prisma.session.deleteMany({
			where: { userId: Number(session?.user?.id) },
		});
	}

	const response = NextResponse.redirect(process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3000");
	response.cookies.delete("next-auth.session-token");
	response.cookies.delete("__Secure-next-auth.session-token");
	return response;
}
