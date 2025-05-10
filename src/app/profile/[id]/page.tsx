import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import ProfileInformation from "@/components/profile-information";
import MiiList from "@/components/mii-list";

interface Props {
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
		keywords: [`tomodachi life`, `mii creator`, `nintendo`, `mii collection`, `profile`],
		creator: user.username,
		category: "Gaming",
		openGraph: {
			locale: "en_US",
			type: "profile",
			images: [user.image ?? "/missing.svg"],
			siteName: "TomodachiShare",
			username: user.username,
			firstName: user.name,
		},
		twitter: {
			card: "summary",
			title: `${user.name} (@${user.username}) - TomodachiShare`,
			description: `View ${user.name}'s profile on TomodachiShare. Creator of ${user._count.miis} Miis. Member since ${joinDate}.`,
			images: [user.image ?? "/missing.svg"],
			creator: user.username!,
		},
		alternates: {
			canonical: `/profile/${user.id}`,
		},
	};
}

export default async function ProfilePage({ params }: Props) {
	const session = await auth();
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
			<MiiList isLoggedIn={session?.user != null} userId={user.id} sessionUserId={Number(session?.user.id ?? -1)} />
		</div>
	);
}
