import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/lib/auth";

import MiiList from "@/components/mii-list";
import Skeleton from "@/components/mii-list/skeleton";
import { Metadata } from "next";

interface Props {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
	const { tags } = await searchParams;

	if (!tags) return {};

	const description = `Discover Miis tagged '${tags}' for your Tomodachi Life island!`;

	return {
		metadataBase: new URL(process.env.BASE_URL!),
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

	return (
		<>
			<h1 className="sr-only">{tags ? `Miis tagged with '${tags}' - TomodachiShare` : "TomodachiShare - index mii list"}</h1>

			<Suspense fallback={<Skeleton />}>
				<MiiList searchParams={await searchParams} />
			</Suspense>
		</>
	);
}
