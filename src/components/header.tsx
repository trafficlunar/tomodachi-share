import Image from "next/image";
import Link from "next/link";

import { auth } from "@/lib/auth";

import SearchBar from "./search-bar";
import RandomLink from "./random-link";
import ProfileOverview from "./profile-overview";
import LogoutButton from "./logout-button";

export default async function Header() {
	const session = await auth();

	return (
		<header className="sticky top-0 z-50 w-full p-4 grid grid-cols-3 gap-2 gap-x-4 items-center bg-amber-50 border-b-4 border-amber-500 shadow-md max-lg:grid-cols-2 max-md:grid-cols-1">
			<Link href={"/"} className="font-black text-3xl text-orange-400 flex items-center gap-2 max-md:justify-center max-md:col-span-2">
				<Image src="/logo.svg" width={56} height={45} alt="logo" />
				TomodachiShare
			</Link>

			<div className="flex justify-center max-lg:justify-end max-md:justify-center">
				<SearchBar />
			</div>

			<ul className="flex justify-end gap-3 items-center h-11 *:h-full max-lg:col-span-2 max-md:justify-center">
				<li title="Random Mii">
					<RandomLink />
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
		</header>
	);
}
