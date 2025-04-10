import { redirect } from "next/navigation";
import Image from "next/image";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default async function ProfileSettingsPage() {
	const session = await auth();

	if (!session) redirect("/login");

	const userExtra = await prisma.user.findUnique({ where: { id: Number(session.user.id) } });
	const likedMiis = await prisma.like.count({ where: { userId: Number(session.user.id) } });

	return (
		<div>
			<div className="flex gap-4 mb-2">
				<Image
					src={session.user.image ?? "/missing.webp"}
					alt="profile picture"
					width={128}
					height={128}
					className="aspect-square rounded-full border-2 border-amber-500 shadow"
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

			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-4 flex flex-col gap-4">
				<div>
					<h2 className="text-2xl font-bold">Profile Settings</h2>
					<p className="text-sm text-zinc-500">Update your account info, username, and preferences.</p>
				</div>

				{/* Separator */}
				<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium my-1">
					<hr className="flex-grow border-zinc-300" />
					<span>Account Info</span>
					<hr className="flex-grow border-zinc-300" />
				</div>

				{/* Change Name */}
				<div className="grid grid-cols-2">
					<div>
						<label htmlFor="deletion" className="font-semibold">
							Change Name
						</label>
						<p className="text-sm text-zinc-500">This is the name shown on your profile — feel free to change it anytime</p>
					</div>

					<div className="flex justify-end gap-1">
						<input type="text" className="pill input w-full max-w-64" />
						<button className="pill button aspect-square !p-1 text-2xl">
							<Icon icon="material-symbols:check-rounded" />
						</button>
					</div>
				</div>

				{/* Change Username */}
				<div className="grid grid-cols-2">
					<div>
						<label htmlFor="deletion" className="font-semibold">
							Change Username
						</label>
						<p className="text-sm text-zinc-500">Your unique tag on the site. Can only be changed once every 90 days</p>
					</div>

					<div className="flex justify-end gap-1">
						<input type="text" className="pill input w-full max-w-64" />
						<button className="pill button aspect-square !p-1 text-2xl">
							<Icon icon="material-symbols:check-rounded" />
						</button>
					</div>
				</div>

				{/* Separator */}
				<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium my-1">
					<hr className="flex-grow border-zinc-300" />
					<span>Danger Zone</span>
					<hr className="flex-grow border-zinc-300" />
				</div>

				{/* Delete Account */}
				<div className="grid grid-cols-2">
					<div>
						<label htmlFor="deletion" className="font-semibold">
							Delete Account
						</label>
						<p className="text-sm text-zinc-500">This will permanently remove your account and all uploaded Miis. This action cannot be undone</p>
					</div>

					<button name="deletion" className="pill button w-fit h-min ml-auto !bg-red-400 !border-red-500 hover:!bg-red-500">
						Delete Account
					</button>
				</div>
			</div>
		</div>
	);
}
