import { Metadata } from "next";
import { Suspense } from "react";
import { Icon } from "@iconify/react";

import Countdown from "@/components/countdown";
import MiiList from "@/components/mii/list";
import Skeleton from "@/components/mii/list/skeleton";

export const dynamic = "force-static";
export const revalidate = 60;

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
	const { page, tags } = await searchParams;

	return (
		<>
			<h1 className="sr-only">{tags ? `Miis tagged with '${tags}' - TomodachiShare` : "TomodachiShare - index mii list"}</h1>

			{(!page || page === "1") && (
				<div className="flex items-center justify-center gap-2 mb-2 max-sm:flex-col">
					<a
						href="https://discord.gg/48cXBFKvWQ"
						className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg px-4 py-2.5 flex justify-center items-center gap-4 w-fit"
					>
						<Icon icon="ic:baseline-discord" fontSize={48} className="text-indigo-400" />
						<div>
							<p className="text-xl font-bold">Join the Discord</p>
							<p className="text-sm">Code: 48cXBFKvWQ</p>
						</div>
					</a>
					<Countdown />
				</div>
			)}
			<Suspense fallback={<Skeleton />}>
				<MiiList searchParams={await searchParams} />
			</Suspense>
		</>
	);
}
