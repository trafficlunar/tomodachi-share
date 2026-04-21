"use client";

import { useState } from "react";
import { Punishment, PunishmentType } from "@prisma/client";

import PunishmentDeletionDialog from "./punishment-deletion-dialog";
import SubmitButton from "../submit-button";

interface ApiResponse {
	success: boolean;
	name: string;
	image: string;
	createdAt: string;
	punishments: Punishment[];
}

export default function Punishments() {
	const [userId, setUserId] = useState(-1);
	const [user, setUser] = useState<ApiResponse | undefined>();

	const [type, setType] = useState<PunishmentType>("WARNING");
	const [duration, setDuration] = useState(1);
	const [reason, setReason] = useState("");
	const [error, setError] = useState<string | undefined>(undefined);

	const handleLookup = async () => {
		const response = await fetch(`/api/admin/lookup?id=${userId}`);
		const data = await response.json();

		if (!response.ok) {
			setError(data.error);
			setUser(undefined);
			return;
		}

		setError(undefined);
		setUser(data);
	};

	const handleSubmit = async () => {
		const response = await fetch(`/api/admin/punish?id=${userId}`, {
			method: "POST",
			body: JSON.stringify({
				type,
				duration,
				reason,
			}),
		});

		if (!response.ok) {
			const { error } = await response.json();
			setError(error);
		}

		// Set all inputs to empty/default
		setType("WARNING");
		setDuration(1);
		setReason("");
		setError("");

		await handleLookup();
	};

	return (
		<div className="bg-orange-100 rounded-xl border-2 border-orange-400 p-2 gap-2">
			<div className="flex justify-center items-center gap-2">
				<input
					type="number"
					placeholder="Enter user ID to lookup..."
					name="user-id"
					value={userId !== -1 ? userId : ""}
					onChange={(e) => setUserId(Number(e.target.value))}
					className="pill input w-full max-w-lg"
				/>
				<button onClick={handleLookup} className="pill button">
					Lookup User
				</button>
			</div>

			{user && (
				<div className="grid grid-cols-2 gap-2 mt-2 max-lg:grid-cols-1">
					<div className="p-4 bg-orange-50 border border-orange-300 rounded-md shadow-sm">
						<div className="flex gap-1">
							<img src={user.image} width={96} height={96} alt="profile_picture" className="rounded-full border-2 border-orange-400" />
							<div className="p-2 flex flex-col">
								<p className="text-xl font-bold">{user.name}</p>
								<p className="text-black/60 text-sm font-medium">@{user.name}</p>
								<p className="text-sm mt-auto">
									<span className="font-medium">Created:</span>{" "}
									{new Date(user.createdAt).toLocaleString("en-GB", {
										day: "2-digit",
										month: "long",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit",
										second: "2-digit",
										timeZone: "UTC",
									})}{" "}
									UTC
								</p>
							</div>
						</div>

						<hr className="border-zinc-300 my-3" />

						<div className="flex flex-col gap-2">
							{user.punishments.length === 0 ? (
								<p className="text-center text-zinc-500 my-2">No punishments found.</p>
							) : (
								<>
									{user.punishments.map((punishment) => (
										<div
											key={punishment.id}
											className={`border rounded-lg p-3 space-y-1 ${
												punishment.type === "WARNING"
													? "bg-yellow-50 border-yellow-400"
													: punishment.type === "TEMP_EXILE"
														? "bg-orange-100 border-orange-200"
														: "bg-red-50 border-red-200"
											}`}
										>
											<div className="flex items-center justify-between mb-2">
												<span
													className={`border px-2 py-1 rounded text-xs font-semibold ${
														punishment.type === "WARNING"
															? "bg-yellow-200 text-yellow-800 border-yellow-500"
															: punishment.type === "TEMP_EXILE"
																? "bg-orange-200 text-orange-800 border-orange-500"
																: "bg-red-200 text-red-800 border-red-500"
													}`}
												>
													{punishment.type}
												</span>

												<div className="flex items-center gap-2">
													<span className="text-sm text-zinc-600">
														{new Date(punishment.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
													</span>
													<PunishmentDeletionDialog punishmentId={punishment.id} />
												</div>
											</div>
											<p className="text-sm text-zinc-600">
												<strong>Reason:</strong> {punishment.reason}
											</p>
											{punishment.type !== "WARNING" && (
												<p className="text-sm text-zinc-600">
													<strong>Expires:</strong>{" "}
													{punishment.expiresAt
														? new Date(punishment.expiresAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
														: "Never"}
												</p>
											)}
											{punishment.type !== "PERM_EXILE" && (
												<p className="text-sm text-zinc-600">
													<strong>Returned:</strong> {JSON.stringify(punishment.returned)}
												</p>
											)}
										</div>
									))}
								</>
							)}
						</div>
					</div>

					<div className="p-4 bg-orange-50 border border-orange-300 rounded-md shadow-sm flex flex-col gap-1">
						{/* Punishment type */}
						<p className="text-sm">Punishment Type</p>
						<select name="punishment-type" value={type} onChange={(e) => setType(e.target.value as PunishmentType)} className="pill input">
							<option value="WARNING">Warning</option>
							<option value="TEMP_EXILE">Temporary Exile</option>
							<option value="PERM_EXILE">Permanent Exile</option>
						</select>

						{/* Punishment duration */}
						{type === "TEMP_EXILE" && (
							<>
								<p className="text-sm">Duration</p>
								<select name="punishment-duration" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="pill input">
									<option value="1">1 Day</option>
									<option value="7">7 Days</option>
									<option value="30">30 Days</option>
								</select>
							</>
						)}

						{/* Punishment reason */}
						<p className="text-sm">Reason</p>
						<textarea
							rows={2}
							maxLength={256}
							placeholder="Type the reason here for the punishment..."
							className="pill input rounded-xl! resize-none"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
						/>

						<div className="flex justify-between items-center mt-2">
							{error && <span className="text-red-400 font-bold">Error: {error}</span>}

							<SubmitButton onClick={handleSubmit} className="ml-auto" />
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
