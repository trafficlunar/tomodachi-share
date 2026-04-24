import { Icon } from "@iconify/react";
import SearchBar from "./search-bar";
import ThemeToggle from "./theme-toggle";
import { Link } from "react-router";
import { useStore } from "@nanostores/react";
import { session } from "../session";
import { useEffect } from "react";

export default function Header() {
	const $session = useStore(session);

	useEffect(() => {
		fetch(`${import.meta.env.VITE_API_URL}/api/auth/session`, { credentials: "include" })
			.then((res) => {
				if (!res.ok) throw new Error("Failed to get session");
				return res.json();
			})
			.then((data) => {
				session.set(data);
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);

	return (
		<header className="sticky top-0 z-50 w-full p-4 grid grid-cols-3 gap-2 gap-x-4 items-center bg-amber-50 border-b-4 border-amber-500 shadow-md max-lg:grid-cols-2 max-md:grid-cols-1">
			<Link
				to={"/"}
				aria-label="Go to Home Page"
				className="font-black text-3xl text-orange-400 flex items-center gap-2 max-md:justify-center max-md:col-span-2"
			>
				<img src="/favicon.svg" width={56} height={45} alt="logo" />
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
						className="pill button p-0! h-full aspect-square dark:bg-orange-300 dark:border-orange-400"
						data-tooltip="Go to a Random Mii"
					>
						<Icon icon="mdi:dice-3" fontSize={28} />
					</Link>
				</li>
				<li>
					<Link to={"/submit"} className="pill button h-full dark:bg-orange-300 dark:border-orange-400">
						Submit
					</Link>
				</li>
				{!$session?.user ? (
					<>
						<li>
							<ThemeToggle size="md" />
						</li>
						<li>
							<Link to={"/login"} className="pill button h-full dark:bg-orange-300 dark:border-orange-400">
								Login
							</Link>
						</li>
					</>
				) : (
					<>
						<li title="Your profile">
							<Link
								to={`/profile/${$session?.user?.id}`}
								aria-label="Go to profile"
								className="pill button gap-2! p-0! h-full max-w-64 dark:bg-orange-300 dark:border-orange-400"
								data-tooltip="Your Profile"
							>
								<img
									src={$session.user.image.startsWith("/profile") ? `${import.meta.env.VITE_API_URL}${$session.user.image}` : $session.user.image}
									onError={(e) => {
										e.currentTarget.onerror = null; // Prevent infinite loops
										e.currentTarget.src = "/guest.png";
									}}
									alt="profile picture"
									width={40}
									height={40}
									className="rounded-full aspect-square object-cover h-full bg-white outline-2 outline-orange-400"
								/>
								<span className="pr-4 overflow-hidden whitespace-nowrap text-ellipsis w-full">{$session?.user?.name ?? "unknown"}</span>
							</Link>
						</li>
						<li>
							<ThemeToggle size="md" />
						</li>
						<li title="Logout">
							<Link
								to={`${import.meta.env.VITE_API_URL}/api/auth/signout`}
								aria-label="Log Out"
								className="pill button p-2! aspect-square h-full dark:bg-orange-300 dark:border-orange-400"
								data-tooltip="Log Out"
							>
								<Icon icon="ic:round-logout" fontSize={24} />
							</Link>
						</li>
					</>
				)}
			</ul>
		</header>
	);
}
