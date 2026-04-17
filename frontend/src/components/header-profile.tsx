import { Icon } from "@iconify/react";
import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { session } from "../session";
import { Link } from "react-router";

export default function HeaderProfile() {
	const API_BASE_URL = import.meta.env.VITE_API_URL;
	const $session = useStore(session);

	useEffect(() => {
		fetch(`${API_BASE_URL}/api/auth/session`, { credentials: "include" })
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
		<>
			{!$session?.user ? (
				<li>
					<Link to={"/login"} className="pill button h-full">
						Login
					</Link>
				</li>
			) : (
				<>
					<li title="Your profile">
						<Link
							to={`/profile/${$session?.user?.id}`}
							aria-label="Go to profile"
							className="pill button gap-2! p-0! h-full max-w-64"
							data-tooltip="Your Profile"
						>
							<img
								src={$session?.user?.image ?? "/guest.png"}
								alt="profile picture"
								width={40}
								height={40}
								className="rounded-full aspect-square object-cover h-full bg-white outline-2 outline-orange-400"
							/>
							<span className="pr-4 overflow-hidden whitespace-nowrap text-ellipsis w-full">{$session?.user?.name ?? "unknown"}</span>
						</Link>
					</li>
					<li title="Logout">
						<Link to={`${API_BASE_URL}/api/auth/signout`} aria-label="Log Out" className="pill button p-2! aspect-square h-full" data-tooltip="Log Out">
							<Icon icon="ic:round-logout" fontSize={24} />
						</Link>
					</li>
				</>
			)}
		</>
	);
}
