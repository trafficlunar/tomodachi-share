"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ProfileOverview() {
	const session = useSession();

	return (
		<li title="Your profile">
			<Link
				href={`/profile/${session?.data?.user?.id}`}
				aria-label="Go to profile"
				className="pill button gap-2! p-0! h-full max-w-64"
				data-tooltip="Your Profile"
			>
				<Image
					src={session?.data?.user?.image ?? "/guest.png"}
					alt="profile picture"
					width={40}
					height={40}
					className="rounded-full aspect-square object-cover h-full bg-white outline-2 outline-orange-400"
				/>
				<span className="pr-4 overflow-hidden whitespace-nowrap text-ellipsis w-full">{session?.data?.user?.name ?? "unknown"}</span>
			</Link>
		</li>
	);
}
