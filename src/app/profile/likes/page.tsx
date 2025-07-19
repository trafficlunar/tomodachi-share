import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/lib/auth";

import ProfileInformation from "@/components/profile-information";
import Skeleton from "@/components/mii-list/skeleton";
import MiiList from "@/components/mii-list";

interface Props {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = {
	title: "My Likes - TomodachiShare",
	description: "View the Miis that you have liked on TomodachiShare",
	robots: {
		index: false,
		follow: false,
	},
};

export default async function ProfileSettingsPage({ searchParams }: Props) {
	const session = await auth();

	if (!session) redirect("/login");

	return (
		<div>
			<ProfileInformation page="likes" />
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex flex-col gap-4 mb-2">
				<div>
					<h2 className="text-2xl font-bold">My Likes</h2>
					<p className="text-sm text-zinc-500">View every Mii you have liked on TomodachiShare.</p>
				</div>
			</div>

			<Suspense fallback={<Skeleton />}>
				<MiiList inLikesPage searchParams={await searchParams} />
			</Suspense>
		</div>
	);
}
