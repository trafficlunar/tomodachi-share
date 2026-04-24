import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RandomPage() {
	const count = await prisma.mii.count();
	if (count === 0) redirect("/");

	const randomIndex = Math.floor(Math.random() * count);
	const randomMii = await prisma.mii.findFirst({
		where: { in_queue: false, quarantined: false, needsFixing: { not: null } },
		skip: randomIndex,
		take: 1,
		select: { id: true },
	});

	if (!randomMii) redirect(process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:4321");
	redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/mii/${randomMii.id}`);
}
