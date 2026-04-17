import { useNavigate, useParams } from "react-router";
import ReasonSelector from "../../components/reason-selector";
import { useEffect, useState } from "react";
import { type ReportReason } from "@tomodachi-share/shared";
import SubmitButton from "../../components/submit-button";

export default function ReportUserPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [reason, setReason] = useState<ReportReason>();
	const [notes, setNotes] = useState<string>();
	const [error, setError] = useState<string | undefined>(undefined);

	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	const API_URL = import.meta.env.VITE_API_URL;

	useEffect(() => {
		fetch(`${API_URL}/api/profile/${id}/info`)
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
	}, [id]);

	if (loading || !user) {
		return <div className="p-6 text-center">Loading...</div>;
	}

	const handleSubmit = async () => {
		const response = await fetch(`${import.meta.env.VITE_API_URL}/api/report`, {
			method: "POST",
			body: JSON.stringify({ id: user.id, type: "user", reason: reason?.toLowerCase(), notes }),
			credentials: "include",
		});
		const { error } = await response.json();

		if (!response.ok) {
			setError(error);
			return;
		}

		navigate("/");
	};

	return (
		<div className="grow flex items-center justify-center">
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-4 flex flex-col gap-4 w-full max-w-2xl">
				<div>
					<h2 className="text-2xl font-bold">Report a User</h2>
					<p className="text-sm text-zinc-500">If you encounter a user causing issues, please report them here</p>
				</div>

				<hr className="border-zinc-300" />

				<div className="bg-orange-100 rounded-xl border-2 border-orange-400 flex p-4 gap-4">
					<img
						src={user.image.startsWith("/profile") ? `${import.meta.env.VITE_API_URL}${user.image}` : user.image}
						onError={(e) => {
							e.currentTarget.onerror = null; // Prevent infinite loops
							e.currentTarget.src = "/guest.png";
						}}
						alt="profile picture"
						width={96}
						height={96}
						className="aspect-square rounded-full border-2 border-orange-400"
					/>
					<p className="text-xl font-bold overflow-hidden text-ellipsis">{user.name}</p>
				</div>

				<div className="w-full grid grid-cols-3 items-center">
					<label htmlFor="reason" className="font-semibold">
						Reason
					</label>
					<ReasonSelector reason={reason} setReason={setReason} />
				</div>

				<div className="w-full grid grid-cols-3">
					<label htmlFor="reason-note" className="font-semibold">
						Reason notes
					</label>
					<textarea
						rows={3}
						maxLength={256}
						placeholder="Type notes here for the report..."
						className="pill input rounded-xl! resize-none col-span-2"
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
					/>
				</div>

				<hr className="border-zinc-300" />
				<div className="flex justify-between items-center">
					{error && <span className="text-red-400 font-bold">Error: {error}</span>}

					<SubmitButton onClick={handleSubmit} className="ml-auto" />
				</div>
			</div>
		</div>
	);
}
