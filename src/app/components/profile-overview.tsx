import { auth } from "@/lib/auth";

export default async function ProfileOverview() {
	const session = await auth();

	return (
		<li title="Your profile">
			<button className="pill button !gap-2 !p-0 h-full max-w-64">
				<img src={session?.user?.image ?? "/missing.webp"} alt="profile picture" className="rounded-full h-full outline-2 outline-orange-400" />
				<span className="pr-4 overflow-hidden whitespace-nowrap text-ellipsis w-full">{session?.user?.name}</span>
			</button>
		</li>
	);
}
