import { Metadata, ResolvingMetadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Icon } from "@iconify/react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import MiiList from "@/components/mii-list";

interface Props {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
	const { slug } = await params;

	const user = await prisma.user.findUnique({
		where: {
			id: Number(slug),
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
			images: [user.image ?? "/missing.webp"],
			siteName: "TomodachiShare",
			username: user.username,
			firstName: user.name,
		},
		twitter: {
			card: "summary",
			title: `${user.name} (@${user.username}) - TomodachiShare`,
			description: `View ${user.name}'s profile on TomodachiShare. Creator of ${user._count.miis} Miis. Member since ${joinDate}.`,
			images: [user.image ?? "/missing.webp"],
			creator: user.username!,
		},
		alternates: {
			canonical: `/profile/${user.id}`,
		},
		robots: {
			index: true,
			follow: true,
		},
	};
}

export default async function ProfilePage({ params }: Props) {
	const session = await auth();
	const { slug } = await params;

	const user = await prisma.user.findUnique({
		where: {
			id: Number(slug),
		},
	});

	if (!user) redirect("/404");

	const likedMiis = await prisma.like.count({ where: { userId: Number(slug) } });

	return (
		<div>
			<div className="flex gap-4 mb-2">
				<Image
					src={user?.image ?? "/missing.webp"}
					alt="profile picture"
					width={128}
					height={128}
					className="aspect-square rounded-full border-2 border-amber-500 shadow"
				/>

				<div className="flex flex-col w-full relative">
					<h1 className="text-4xl font-extrabold w-full break-words">{user?.name}</h1>
					<h2 className="text-lg font-semibold break-words">@{user?.username}</h2>

					<h4 className="mt-auto text-sm">
						Liked <span className="font-bold">{likedMiis}</span> Miis
					</h4>
					<h4 className="text-sm" title={`${user?.createdAt.toLocaleTimeString("en-GB", { timeZone: "UTC" })} UTC`}>
						Created: {user?.createdAt.toLocaleDateString("en-GB", { month: "long", day: "2-digit", year: "numeric" })}
					</h4>

					{session?.user.id == slug && (
						<Link href="/profile/settings" className="pill button absolute right-0 bottom-0 !px-4">
							<Icon icon="material-symbols:settings-rounded" className="text-2xl mr-2" />
							<span>Settings</span>
						</Link>
					)}
				</div>
			</div>

			<MiiList isLoggedIn={session?.user != null} userId={user?.id} sessionUserId={Number(session?.user.id ?? -1)} />
		</div>
	);
}
