import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { prisma } from "@/lib/prisma";

import ProfileInformation from "@/components/profile-information";
import MiiList from "@/components/mii-list";
import Skeleton from "@/components/mii-list/skeleton";

interface Props {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
	params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;

	const user = await prisma.user.findUnique({
		where: {
			id: Number(id),
		},
		include: {
			_count: {
				select: {
					miis: true,
				},
			},
		},
	});

	// Bots get redirected anyways
	if (!user) return {};

	const joinDate = user.createdAt.toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
	});

	return {
		metadataBase: new URL(process.env.BASE_URL!),
		title: `${user.name} (@${user.username}) - TomodachiShare`,
		description: `View ${user.name}'s profile on TomodachiShare. Creator of ${user._count.miis} Miis. Member since ${joinDate}.`,
		keywords: ["mii", "tomodachi life", "nintendo", "mii creator", "mii collection", "profile"],
		creator: user.username,
		openGraph: {
			type: "profile",
			title: `${user.name} (@${user.username}) - TomodachiShare`,
			description: `View ${user.name}'s profile on TomodachiShare. Creator of ${user._count.miis} Miis. Member since ${joinDate}.`,
			images: [user.image ?? "/guest.svg"],
			username: user.username,
			firstName: user.name,
		},
		twitter: {
			card: "summary",
			title: `${user.name} (@${user.username}) - TomodachiShare`,
			description: `View ${user.name}'s profile on TomodachiShare. Creator of ${user._count.miis} Miis. Member since ${joinDate}.`,
			images: [user.image ?? "/guest.svg"],
			creator: user.username!,
		},
		alternates: {
			canonical: `/profile/${user.id}`,
		},
	};
}

export default async function ProfilePage({ searchParams, params }: Props) {
	const { id } = await params;

	const user = await prisma.user.findUnique({
		where: {
			id: Number(id),
		},
	});

	if (!user) redirect("/404");

	return (
		<div>
			<ProfileInformation userId={user.id} />
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex flex-col gap-4">
				<Suspense fallback={<Skeleton />}>
					<MiiList searchParams={await searchParams} userId={user.id} />
				</Suspense>
			</div>
		</div>
	);
}
