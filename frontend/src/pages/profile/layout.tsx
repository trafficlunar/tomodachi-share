import { Outlet, useNavigate, useParams } from "react-router";
import ProfileInformation from "../../components/profile-information";
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { session } from "../../session";

export default function ProfileLayout() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const $session = useStore(session);

	useEffect(() => {
		if ($session === undefined) return; // session still loading
		if ($session === null) {
			// not logged in
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

	return (
		<div>
			<ProfileInformation user={user} />
			<Outlet />
		</div>
	);
}
