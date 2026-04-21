import { useStore } from "@nanostores/react";
import dayjs from "dayjs";
import { Link, Navigate } from "react-router";
import { session } from "../session";
import { useEffect, useState } from "react";
import ReturnToIsland from "../components/admin/return-to-island";

export default function PunishedPage() {
	const $session = useStore(session);
	const [activePunishment, setActivePunishment] = useState<any | null | undefined>(undefined);

	const API_URL = import.meta.env.VITE_API_URL;

	useEffect(() => {
		fetch(`${API_URL}/api/is-punished`, { credentials: "include" })
			.then((res) => {
				if (!res.ok) throw new Error("Failed to get punishment");
				return res.json();
			})
			.then((data) => {
				setActivePunishment(data.punishment);
			})
			.catch((err) => {
				console.error(err);
				setActivePunishment(null);
			});
	}, []);

	if ($session === undefined || activePunishment === undefined) return <div className="p-6 text-center">Loading...</div>;
	if ($session === null || !activePunishment) return <Navigate to="/" replace />;

	const expiresAt = dayjs(activePunishment.expiresAt);
	const createdAt = dayjs(activePunishment.createdAt);
	const hasExpired = activePunishment.type === "TEMP_EXILE" && activePunishment.expiresAt! > new Date();
	const duration = activePunishment.type === "TEMP_EXILE" && Math.ceil(expiresAt.diff(createdAt, "days", true));

	return (
		<div className="grow flex items-center justify-center">
			<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl shadow-lg p-8 max-w-xl w-full flex flex-col">
				<h2 className="text-4xl font-black mb-2">
					{activePunishment.type === "PERM_EXILE"
						? "Exiled permanently"
						: activePunishment.type === "TEMP_EXILE"
							? `Exiled for ${duration} ${duration === 1 ? "day" : "days"}`
							: "Warning"}
				</h2>
				<p>
					You have been exiled from the TomodachiShare island because you violated the{" "}
					<Link to={"/terms-of-service"} className="text-blue-500">
						Terms of Service
					</Link>
					.
				</p>

				<p className="mt-3">
					<span className="font-bold">Reviewed:</span> {createdAt.toDate().toLocaleDateString("en-GB")} at {createdAt.toDate().toLocaleString("en-GB")}
				</p>

				<p className="mt-1">
					<span className="font-bold">Reason:</span> {activePunishment.reason}
				</p>

				<hr className="border-zinc-300 mt-2 mb-4" />

				{activePunishment.type !== "PERM_EXILE" ? (
					<>
						<p className="mb-2">Once your punishment ends, you can return by checking the box below.</p>
						<ReturnToIsland hasExpired={hasExpired} />
					</>
				) : (
					<>
						<p>Your punishment is permanent, therefore you cannot return.</p>
					</>
				)}
			</div>
		</div>
	);
}
