import Link from "next/link";
import SearchBar from "./search-bar";

import { Icon } from "@iconify/react";

export default function Header() {
	return (
		<div className="fixed w-full p-4 flex justify-between items-center bg-amber-100 border-b-2 border-amber-200">
			<Link href={"/"} className="font-black text-3xl">
				TomodachiShare
			</Link>

			<SearchBar />

			<ul className="flex gap-2 items-center">
				<li>
					<Link href={"/login"} className="flex justify-center items-center p-0.5 bg-orange-400 border-2 rounded">
						<Icon icon="ri:dice-fill" fontSize={32} />
					</Link>
				</li>
				<li>
					<Link href={"/login"} className="flex justify-center items-center px-4 py-1.5 bg-orange-400 border-2 rounded">
						Submit
					</Link>
				</li>
				<li>
					<Link href={"/login"} className="flex justify-center items-center px-4 py-1.5 bg-orange-400 border-2 rounded">
						Login
					</Link>
				</li>
			</ul>
		</div>
	);
}
