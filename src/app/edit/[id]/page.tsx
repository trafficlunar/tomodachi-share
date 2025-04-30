import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditForm from "@/components/submit-form/edit-form";

interface Props {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;

	const mii = await prisma.mii.findUnique({
		where: {
			id: Number(id),
		},
	});

	return {
		title: `${mii?.name} - TomodachiShare`,
		description: `Edit the name, tags, and images of '${mii?.name}'`,
		robots: {
			index: false,
			follow: false,
		},
	};
}

export default async function MiiPage({ params }: Props) {
	const { id } = await params;
	const session = await auth();

	const mii = await prisma.mii.findUnique({
		where: {
			id: Number(id),
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
