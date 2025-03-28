import Link from "next/link";
import SearchBar from "./search-bar";

import { Icon } from "@iconify/react";

export default function Header() {
	return (
		<div className="fixed top-0 w-full p-4 flex justify-between items-center bg-amber-50 border-b-4 border-amber-200 shadow-md">
			<Link href={"/"} className="font-black text-3xl tracking-wide text-orange-400">
				TomodachiShare
			</Link>

			<SearchBar />

			<ul className="flex gap-3 items-center">
				<li>
					<Link href={"/random"} className="button !p-1.5">
						<Icon icon="mdi:dice-3" fontSize={28} />
					</Link>
				</li>
				<li>
					<Link href={"/submit"} className="button">
						Submit
					</Link>
				</li>
				<li>
					<Link href={"/login"} className="button">
						Login
					</Link>
				</li>
			</ul>
		</div>
	);
}
