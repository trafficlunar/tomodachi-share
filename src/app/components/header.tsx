import Link from "next/link";
import { Icon } from "@iconify/react";

import { auth } from "@/lib/auth";

import SearchBar from "./search-bar";
import ProfileOverview from "./profile-overview";
import LogoutButton from "./logout-button";

export default async function Header() {
	const session = await auth();

	return (
		<div className="sticky top-0 z-50 w-full p-4 grid grid-cols-3 gap-2 gap-x-4 items-center bg-amber-50 border-b-4 border-amber-500 shadow-md max-lg:grid-cols-2 max-sm:grid-cols-1">
			<Link href={"/"} className="font-black text-3xl tracking-wide text-orange-400 max-sm:text-center max-sm:col-span-3">
				TomodachiShare
			</Link>

			<div className="flex justify-center max-lg:justify-end max-sm:col-span-3 max-sm:justify-center">
				<SearchBar />
			</div>

			<ul className="flex justify-end gap-3 items-center h-11 *:h-full max-lg:col-span-2 max-sm:justify-center max-sm:col-span-3">
				<li title="Random Mii">
					<Link href={"/random"} className="pill button !p-0 h-full aspect-square">
						<Icon icon="mdi:dice-3" fontSize={28} />
					</Link>
				</li>
				<li>
					<Link href={"/submit"} className="pill button h-full">
						Submit
					</Link>
				</li>
				{!session?.user ? (
					<li>
						<Link href={"/login"} className="pill button h-full">
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
