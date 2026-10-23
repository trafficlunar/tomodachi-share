import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
	const target = new URL("/login", process.env.FRONTEND_URL ?? "http://localhost:5173");
	target.search = req.nextUrl.search; // keeps ?error=
	return NextResponse.redirect(target);
}
