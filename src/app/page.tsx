import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import MiiList from "@/components/mii-list";
import Skeleton from "@/components/mii-list/skeleton";

interface Props {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
	const { tags } = await searchParams;

	if (!tags) return {};

	const description = `Discover Miis tagged '${tags}' for your Tomodachi Life island!`;

	return {
		metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
		title: `Miis tagged with '${tags}' - TomodachiShare`,
		description,
		keywords: [...tags, "mii", "tomodachi life", "nintendo", "tomodachishare", "tomodachi-share", "mii creator", "mii collection"],
		openGraph: {
			description,
		},
		twitter: {
			description,
		},
	};
}

export default async function Page({ searchParams }: Props) {
	const session = await auth();
	const { tags } = await searchParams;

	if (session?.user && !session.user.username) {
		redirect("/create-username");
	}
	if (session?.user) {
		const activePunishment = await prisma.punishment.findFirst({
			where: {
				userId: Number(session?.user.id),
				returned: false,
			},
		});
		if (activePunishment) redirect("/off-the-island");
	}

	return (
		<>
			<h1 className="sr-only">{tags ? `Miis tagged with '${tags}' - TomodachiShare` : "TomodachiShare - index mii list"}</h1>

			<Suspense fallback={<Skeleton />}>
				<MiiList searchParams={await searchParams} />
			</Suspense>
		</>
	);
}
