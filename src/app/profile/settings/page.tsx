import { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Icon } from "@iconify/react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import ProfileSettings from "@/components/profile-settings";

export const metadata: Metadata = {
	title: "Profile Settings - TomodachiShare",
	description: "Change your account info or delete it",
};

export default async function ProfileSettingsPage() {
	const session = await auth();

	if (!session) redirect("/login");

	const userExtra = await prisma.user.findUnique({ where: { id: Number(session.user.id) } });
	const likedMiis = await prisma.like.count({ where: { userId: Number(session.user.id) } });

	return (
		<div>
			<div className="flex gap-4 mb-2">
				<Image
					src={session.user.image ?? "/missing.svg"}
					alt="profile picture"
					width={128}
					height={128}
					className="aspect-square rounded-full bg-white border-2 border-amber-500 shadow"
				/>

				<div className="flex flex-col w-full relative">
					<h1 className="text-4xl font-extrabold w-full break-words">{session.user.name}</h1>
					<h2 className="text-lg font-semibold break-words">@{session.user.username}</h2>

					<h4 className="mt-auto">
						Liked <span className="font-bold">{likedMiis}</span> Miis
					</h4>
					<h4 className="text-sm" title={`${userExtra!.createdAt.toLocaleTimeString("en-GB", { timeZone: "UTC" })} UTC`}>
						Created: {userExtra!.createdAt.toLocaleDateString("en-GB", { month: "long", day: "2-digit", year: "numeric" })}
					</h4>

					<Link href={`/profile/${session.user.id}`} className="pill button absolute right-0 bottom-0 !px-4">
						<Icon icon="tabler:chevron-left" className="text-2xl mr-2" />
						<span>Back</span>
					</Link>
				</div>
			</div>

			<ProfileSettings />
		</div>
	);
}
