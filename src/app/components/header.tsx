import Link from "next/link";
import SearchBar from "./search-bar";

import { Icon } from "@iconify/react";

export default function Header() {
	return (
		<div className="fixed w-full p-4 flex justify-between items-center bg-amber-50 border-b-4 border-amber-200 shadow-md">
			<Link href={"/"} className="font-black text-3xl tracking-wide text-orange-400">
				TomodachiShare
			</Link>

			<SearchBar />

			<ul className="flex gap-3 items-center">
				<li>
					<Link
						href={"/random"}
						className="flex justify-center items-center p-1.5 bg-orange-300 border-2 border-orange-400 rounded-full shadow-md hover:bg-orange-400"
					>
						<Icon icon="mdi:dice-3" fontSize={28} />
					</Link>
				</li>
				<li>
					<Link
						href={"/submit"}
						className="flex justify-center items-center px-5 py-2 bg-orange-300 border-2 border-orange-400 rounded-full shadow-md hover:bg-orange-400"
					>
						Submit
					</Link>
				</li>
				<li>
					<Link
						href={"/login"}
						className="flex justify-center items-center px-5 py-2 bg-orange-300 border-2 border-orange-400 rounded-full shadow-md hover:bg-orange-400"
					>
						Login
					</Link>
				</li>
			</ul>
		</div>
	);
}
