import { Icon } from "@iconify/react";
import SearchBar from "./search-bar";
import HeaderProfile from "./header-profile";
import { Link } from "react-router";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 w-full p-4 grid grid-cols-3 gap-2 gap-x-4 items-center bg-amber-50 border-b-4 border-amber-500 shadow-md max-lg:grid-cols-2 max-md:grid-cols-1">
			<Link
				to={"/"}
				aria-label="Go to Home Page"
				className="font-black text-3xl text-orange-400 flex items-center gap-2 max-md:justify-center max-md:col-span-2"
			>
				<img src="/logo.svg" width={56} height={45} alt="logo" />
				TomodachiShare
			</Link>

			<div className="flex justify-center max-lg:justify-end max-md:justify-center">
				<SearchBar />
			</div>

			<ul className="flex justify-end gap-3 items-center h-11 *:h-full max-lg:col-span-2 max-md:justify-center">
				<li title="Random Mii">
					<Link
						to={`${import.meta.env.VITE_API_URL}/random`}
						aria-label="Go to Random Link"
						className="pill button p-0! h-full aspect-square"
						data-tooltip="Go to a Random Mii"
					>
						<Icon icon="mdi:dice-3" fontSize={28} />
					</Link>
				</li>
				<li>
					<Link to={"/submit"} className="pill button h-full">
						Submit
					</Link>
				</li>
				<HeaderProfile />
			</ul>
		</header>
	);
}
