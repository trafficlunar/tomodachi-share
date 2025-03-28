import Link from "next/link";
import { getServerSession } from "next-auth";
import { Icon } from "@iconify/react";

import SearchBar from "./search-bar";
import ProfileOverview from "./profile-overview";
import LogoutButton from "./logout-button";

export default async function Header() {
	const session = await getServerSession();

	return (
		<div className="fixed top-0 w-full p-4 flex justify-between items-center bg-amber-50 border-b-4 border-amber-200 shadow-md">
			<Link href={"/"} className="font-black text-3xl tracking-wide text-orange-400">
				TomodachiShare
			</Link>

			<SearchBar />

			<ul className="flex gap-3 items-center h-11 *:h-full">
				<li title="Random Mii">
					<Link href={"/random"} className="button !p-0 h-full aspect-square">
						<Icon icon="mdi:dice-3" fontSize={28} />
					</Link>
				</li>
				<li>
					<Link href={"/submit"} className="button h-full">
						Submit
					</Link>
				</li>
				{!session?.user ? (
					<li>
						<Link href={"/login"} className="button h-full">
							Login
						</Link>
					</li>
				) : (
					<>
						<ProfileOverview />
						<LogoutButton />
					</>
				)}
			</ul>
		</div>
	);
}
