import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props {
	userId?: number;
	inSettings?: boolean;
}

export default async function ProfileInformation({ userId, inSettings }: Props) {
	const session = await auth();

	const id = userId ? userId : Number(session?.user.id);
	const user = await prisma.user.findUnique({ where: { id } });
	const likedMiis = await prisma.like.count({ where: { userId: id } });

	if (!user) return null;

	return (
		<div className="flex gap-4 mb-2 max-md:flex-col">
			<div className="flex w-full gap-4 overflow-x-scroll">
				{/* Profile picture */}
				<Image
					src={user.image ?? "/guest.webp"}
					alt="profile picture"
					width={128}
					height={128}
					className="size-32 aspect-square rounded-full bg-white border-2 border-orange-400 shadow max-md:self-center"
				/>
				{/* User information */}
				<div className="flex flex-col w-full relative">
					<h1 className="text-4xl font-extrabold w-full break-words flex items-center gap-2">
						{user.name}
						{id === Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID) && (
							<div data-tooltip="Admin" className="font-normal text-orange-400">
								<Icon icon="mdi:shield-moon" />
							</div>
						)}
						{process.env.NEXT_PUBLIC_CONTRIBUTORS_USER_IDS?.split(",").includes(id.toString()) && (
							<div data-tooltip="Contributor" className="font-normal text-orange-400">
								<Icon icon="mingcute:group-fill" />
							</div>
						)}
					</h1>
					<h2 className="text-lg font-semibold break-words">@{user?.username}</h2>

					<h4 className="mt-auto text-sm">
						Liked <span className="font-bold">{likedMiis}</span> Miis
					</h4>
					<h4 className="text-sm" title={`${user.createdAt.toLocaleTimeString("en-GB", { timeZone: "UTC" })} UTC`}>
						Created: {user.createdAt.toLocaleDateString("en-GB", { month: "long", day: "2-digit", year: "numeric" })}
					</h4>
				</div>
			</div>

			{/* Buttons */}
			<div className="flex flex-col items-end justify-end gap-1 max-md:flex-row">
				{Number(session?.user.id) != id && (
					<Link href={`/report/user/${id}`} className="pill button !px-4">
						<Icon icon="material-symbols:flag-rounded" className="text-2xl mr-2" />
						<span>Report</span>
					</Link>
				)}
				{Number(session?.user.id) == id && Number(session?.user.id) === Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID) && (
					<Link href="/admin" className="pill button !px-4">
						<Icon icon="mdi:shield-moon" className="text-2xl mr-2" />
						<span>Admin</span>
					</Link>
				)}
				{!inSettings && Number(session?.user.id) == id && (
					<Link href="/profile/settings" className="pill button !px-4">
						<Icon icon="material-symbols:settings-rounded" className="text-2xl mr-2" />
						<span>Settings</span>
					</Link>
				)}
				{inSettings && (
					<Link href={`/profile/${id}`} className="pill button !px-4">
						<Icon icon="tabler:chevron-left" className="text-2xl mr-2" />
						<span>Back</span>
					</Link>
				)}
			</div>
		</div>
	);
}
