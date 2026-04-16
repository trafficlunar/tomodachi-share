import { Icon } from "@iconify/react";

import Description from "./description";
import { type User } from "@tomodachi-share/backend";
import { useStore } from "@nanostores/react";
import { session } from "../session";

interface Props {
	user?: User | any;
	page?: "settings" | "likes";
}

export default function ProfileInformation({ user, page }: Props) {
	const $session = useStore(session);

	const isAdmin = (!user ? $session.user.id : user.id) === Number(import.meta.env.PUBLIC_ADMIN_USER_ID);
	const isContributor = import.meta.env.PUBLIC_CONTRIBUTORS_USER_IDS?.split(",").includes(user.id);
	const isOwnProfile = !user || $session?.user?.id === user.id;

	return (
		<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex gap-4 mb-2 max-md:flex-col">
			<div className="flex w-full gap-4 overflow-x-scroll">
				{/* Profile picture */}
				<a href={`/profile/${user.id}`} className="size-28 aspect-square">
					<image src={user.image ?? "/guest.png"} className="rounded-full bg-white border-2 border-orange-400 shadow max-md:self-center" />
				</a>
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
					<h2 className="text-black/60 text-sm font-semibold wrap-break-word">ID: {user?.id}</h2>

					<div className="mt-3 text-sm flex gap-8">
						<h4 title={`${new Date(user.createdAt).toLocaleTimeString("en-GB", { timeZone: "UTC" })} UTC`}>
							<span className="font-medium">Created:</span>{" "}
							{new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", day: "2-digit", year: "numeric" })}
						</h4>
						<h4>
							Liked <span className="font-bold">{user._count.likes}</span> Miis
						</h4>
					</div>

					{user.description && <Description text={user.description} className="max-h-32!" />}
				</div>
			</div>

			{/* Buttons */}
			<div className="flex gap-1 w-fit text-3xl text-orange-400 max-md:place-self-center *:size-17 *:flex *:flex-col *:items-center *:gap-1 **:transition-discrete **:duration-150 *:hover:brightness-75 *:hover:scale-[1.08] *:[&_span]:text-sm">
				{!isOwnProfile && (
					<a aria-label="Report User" href={`${import.meta.env.PUBLIC_API_URL}/report/user/${user.id}`}>
						<Icon icon="material-symbols:flag-rounded" />
						<span>Report</span>
					</a>
				)}
				{isOwnProfile && isAdmin && (
					<a aria-label="Go to Admin" href="/admin">
						<Icon icon="mdi:shield-moon" />
						<span>Admin</span>
					</a>
				)}
				{/* {isOwnProfile && page !== "likes" && (
					<a aria-label="Go to My Likes" href="/profile/likes">
						<Icon icon="icon-park-solid:like" />
						<span>My Likes</span>
					</a>
				)} */}
				{isOwnProfile && page !== "settings" && (
					<a aria-label="Go to Settings" href="/profile/settings">
						<Icon icon="material-symbols:settings-rounded" />
						<span>Settings</span>
					</a>
				)}
				{page && (
					<a aria-label="Go Back to Profile" href={`/profile/${user.id}`}>
						<Icon icon="tabler:chevron-left" />
						<span>Back</span>
					</a>
				)}
			</div>
		</div>
	);
}
