import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function GET() {
	const count = await prisma.mii.count();
	if (count === 0) redirect("/");

	const randomIndex = Math.floor(Math.random() * count);
	const randomMii = await prisma.mii.findFirst({
		skip: randomIndex,
		take: 1,
		select: { id: true },
	});

	if (!randomMii) redirect("/");

	redirect(`/mii/${randomMii.id}`);
}
