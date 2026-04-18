import { Outlet, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { session } from "../../session";
import { Icon } from "@iconify/react";
import { Link } from "react-router";
import Description from "../../components/description";

export default function ProfileLayout() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const $session = useStore(session);

	useEffect(() => {
		if ($session === undefined) return; // session still loading

		const userId = id ?? $session?.user?.id;
		if (!userId) {
			navigate("/404");
			return;
		}

		const userId = id ? id : $session.user!.id;

		fetch(`${import.meta.env.VITE_API_URL}/api/profile/${userId}/info`)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch profile");
				return res.json();
			})
			.then((data) => {
				setUser(data);
				setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				setLoading(false);
				navigate("/404");
			});
	}, [id, $session]);

	if (loading || !user) {
		return <div className="p-6 text-center">Loading...</div>;
	}

	const currentUser = user ?? $session?.user;
	const page = location.pathname;
	const isAdmin = currentUser?.id === Number(import.meta.env.VITE_ADMIN_USER_ID);
	const isContributor = import.meta.env.VITE_CONTRIBUTORS_USER_IDS?.split(",").includes(user?.id);
	const isOwnProfile = currentUser?.id === user?.id;

	return (
		<div>
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex gap-4 mb-2 max-md:flex-col">
				<div className="flex w-full gap-4 overflow-x-scroll">
					{/* Profile picture */}
					<Link to={`/profile/${user.id}`} className="size-28 aspect-square">
						<img
							src={user.image.startsWith("/profile") ? `${import.meta.env.VITE_API_URL}${user.image}` : user.image}
							onError={(e) => {
								e.currentTarget.onerror = null; // Prevent infinite loops
								e.currentTarget.src = "/guest.png";
							}}
							className="rounded-full bg-white border-2 border-orange-400 shadow w-full max-md:self-center"
						/>
					</Link>
					{/* User information */}
					<div className="flex flex-col w-full relative py-3">
						<div className="flex items-center gap-2">
							<h1 className="text-3xl font-extrabold wrap-break-word">{user.name}</h1>
							{isAdmin && (
								<div data-tooltip="Admin" className="text-orange-400">
									<Icon icon="mdi:shield-moon" className="text-2xl" />
								</div>
							)}
							{isContributor && (
								<div data-tooltip="Contributor" className="text-orange-400">
									<Icon icon="mingcute:group-fill" className="text-2xl" />
								</div>
							)}
						</div>
						<h2 className="text-black/60 text-sm font-semibold wrap-break-word">ID: {user?.id}</h2>

						<div className="mt-3 text-sm flex gap-8">
							<h4 title={`${new Date(user.createdAt).toLocaleTimeString("en-GB", { timeZone: "UTC" })} UTC`}>
								<span className="font-medium">Created:</span>{" "}
								{new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", day: "2-digit", year: "numeric" })}
							</h4>
							<h4>
								Liked <span className="font-bold">{user._count.likes}</span> Miis
							</h4>
						</div>

						{user.description && <Description text={user.description} className="max-h-32!" />}
					</div>
				</div>

				{/* Buttons */}
				<div className="flex gap-1 w-fit text-3xl text-orange-400 max-md:place-self-center *:size-17 *:flex *:flex-col *:items-center *:gap-1 **:transition-discrete **:duration-150 *:hover:brightness-75 *:hover:scale-[1.08] *:[&_span]:text-sm">
					{!isOwnProfile && (
						<Link aria-label="Report User" to={`/report/profile/${user.id}`}>
							<Icon icon="material-symbols:flag-rounded" />
							<span>Report</span>
						</Link>
					)}
					{isOwnProfile && isAdmin && (
						<Link aria-label="Go to Admin" to="/admin">
							<Icon icon="mdi:shield-moon" />
							<span>Admin</span>
						</Link>
					)}
					{isOwnProfile && page !== "/profile/likes" && (
						<Link aria-label="Go to My Likes" to="/profile/likes">
							<Icon icon="icon-park-solid:like" />
							<span>My Likes</span>
						</Link>
					)}
					{isOwnProfile && page !== "/profile/settings" && (
						<Link aria-label="Go to Settings" to="/profile/settings">
							<Icon icon="material-symbols:settings-rounded" />
							<span>Settings</span>
						</Link>
					)}
					{(page === "/profile/likes" || page === "/profile/settings") && (
						<Link aria-label="Go Back to Profile" to={`/profile/${user.id}`}>
							<Icon icon="tabler:chevron-left" />
							<span>Back</span>
						</Link>
					)}
				</div>
			</div>

			<Outlet />
		</div>
	);
}
