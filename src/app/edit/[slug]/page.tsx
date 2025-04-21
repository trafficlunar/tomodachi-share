import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditForm from "@/components/submit-form/edit-form";

interface Props {
	params: Promise<{ slug: string }>;
}

export default async function MiiPage({ params }: Props) {
	const { slug } = await params;
	const session = await auth();

	const mii = await prisma.mii.findUnique({
		where: {
			id: Number(slug),
		},
		include: {
			_count: {
				select: { likedBy: true }, // Get total like count
			},
		},
	});

	// Check ownership
	if (!mii || Number(session?.user.id) !== mii.userId) redirect("/404");

	return <EditForm mii={mii} likes={mii._count.likedBy} />;
}
