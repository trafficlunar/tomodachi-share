import Image from "next/image";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function ProfileOverview() {
	const session = await auth();

	return (
		<li title="Your profile">
			<Link href={`/profile/${session?.user.id}`} className="pill button !gap-2 !p-0 h-full max-w-64">
				<Image
					src={session?.user?.image ?? "/missing.svg"}
					alt="profile picture"
					width={40}
					height={40}
					className="rounded-full aspect-square object-cover h-full bg-white outline-2 outline-orange-400"
				/>
				<span className="pr-4 overflow-hidden whitespace-nowrap text-ellipsis w-full">{session?.user?.username ?? "unknown"}</span>
			</Link>
		</li>
	);
}
