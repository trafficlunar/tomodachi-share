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

export default async function ProfilePage({ params }: Props) {
	const session = await auth();
	const { slug } = await params;

	const user = await prisma.user.findFirst({
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

					<h4 className="mt-auto">
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

			<MiiList isLoggedIn={session?.user != null} userId={user?.id} />
		</div>
	);
}
