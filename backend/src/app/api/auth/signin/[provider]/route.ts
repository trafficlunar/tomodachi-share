import { type NextRequest } from "next/server";
import { signIn } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
	return signIn((await params).provider);
}
