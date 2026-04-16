import { useEffect, useState } from "react";
import ProfileInformation from "../profile-information";

interface Props {
	id: string;
}

export default function ProfilePage({ id }: Props) {
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch(`${import.meta.env.PUBLIC_API_URL}/api/profile/${id}/info`)
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
				window.location.href = "/404";
			});
	}, []);

	if (loading || !user) {
		return <div className="p-6 text-center">Loading...</div>;
	}

	return (
		<div>
			<ProfileInformation user={user} />
			{/* <Suspense fallback={<Skeleton />}>
				<MiiList searchParams={await searchParams} userId={user.id} />
			</Suspense> */}
		</div>
	);
}
