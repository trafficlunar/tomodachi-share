import Link from "next/link";
import { Icon } from "@iconify/react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import ProfilePicture from "./profile-picture";
import Description from "./description";

interface Props {
	userId?: number;
	page?: "settings" | "likes";
}

export default async function ProfileInformation({ userId, page }: Props) {
	const session = await auth();

	const id = userId ? userId : Number(session?.user.id);
	const user = await prisma.user.findUnique({ where: { id } });
	const likedMiis = await prisma.like.count({ where: { userId: id } });

	if (!user) return null;

	const isAdmin = id === Number(process.env.NEXT_PUBLIC_ADMIN_USER_ID);
	const isContributor = process.env.NEXT_PUBLIC_CONTRIBUTORS_USER_IDS?.split(",").includes(id.toString());
	const isOwnProfile = Number(session?.user.id) === id;

	return (
		<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex gap-4 mb-2 max-md:flex-col">
			<div className="flex w-full gap-4 overflow-x-scroll">
				{/* Profile picture */}
				<Link href={`/profile/${user.id}`} className="size-28 aspect-square">
					<ProfilePicture src={user.image ?? "/guest.webp"} className="rounded-full bg-white border-2 border-orange-400 shadow max-md:self-center" />
				</Link>
				{/* User information */}
				<div className="flex flex-col w-full relative py-3">
					<div className="flex items-center gap-2">
						<h1 className="text-3xl font-extrabold wrap-break-word">{user.name}</h1>
						{isAdmin && (
							<div data-tooltip="Admin" className="text-orange-400">
								<Icon icon="mdi:shield-moon" className="text-2xl" />
							</div>
						)}
						{isContributor && (
							<div data-tooltip="Contributor" className="text-orange-400">
								<Icon icon="mingcute:group-fill" className="text-2xl" />
							</div>
						)}
					</div>
					<h2 className="text-black/60 text-sm font-semibold wrap-break-word">@{user?.username}</h2>

					<div className="mt-3 text-sm flex gap-8">
						<h4 title={`${user.createdAt.toLocaleTimeString("en-GB", { timeZone: "UTC" })} UTC`}>
							<span className="font-medium">Created:</span>{" "}
							{user.createdAt.toLocaleDateString("en-GB", { month: "long", day: "2-digit", year: "numeric" })}
						</h4>
						<h4>
							Liked <span className="font-bold">{likedMiis}</span> Miis
						</h4>
					</div>

					{user.description && <Description text={user.description} className="max-h-32!" />}
				</div>
			</div>

			{/* Buttons */}
			<div className="flex gap-1 w-fit text-3xl text-orange-400 max-md:place-self-center *:size-17 *:flex *:flex-col *:items-center *:gap-1 **:transition-discrete **:duration-150 *:hover:brightness-75 *:hover:scale-[1.08] *:[&_span]:text-sm">
				{!isOwnProfile && (
					<Link aria-label="Report User" href={`/report/user/${id}`}>
						<Icon icon="material-symbols:flag-rounded" />
						<span>Report</span>
					</Link>
				)}
				{isOwnProfile && isAdmin && (
					<Link aria-label="Go to Admin" href="/admin">
						<Icon icon="mdi:shield-moon" />
						<span>Admin</span>
					</Link>
				)}
				{isOwnProfile && page !== "likes" && (
					<Link aria-label="Go to My Likes" href="/profile/likes">
						<Icon icon="icon-park-solid:like" />
						<span>My Likes</span>
					</Link>
				)}
				{isOwnProfile && page !== "settings" && (
					<Link aria-label="Go to Settings" href="/profile/settings">
						<Icon icon="material-symbols:settings-rounded" />
						<span>Settings</span>
					</Link>
				)}
				{page && (
					<Link aria-label="Go Back to Profile" href={`/profile/${id}`}>
						<Icon icon="tabler:chevron-left" />
						<span>Back</span>
					</Link>
				)}
			</div>
		</div>
	);
}
