"use client";

import { useRouter } from "next/navigation";

import { useState } from "react";
import SubmitDialogButton from "./submit-dialog-button";
import DeleteAccount from "./delete-account";

import { displayNameSchema, usernameSchema } from "@/lib/schemas";
import dayjs from "dayjs";

export default function ProfileSettings() {
	const router = useRouter();

	const [displayName, setDisplayName] = useState("");
	const [username, setUsername] = useState("");

	const [displayNameChangeError, setDisplayNameChangeError] = useState<string | undefined>(undefined);
	const [usernameChangeError, setUsernameChangeError] = useState<string | undefined>(undefined);

	const usernameDate = dayjs().add(90, "days");

	const handleSubmitDisplayNameChange = async (close: () => void) => {
		const parsed = displayNameSchema.safeParse(displayName);
		if (!parsed.success) {
			setDisplayNameChangeError(parsed.error.errors[0].message);
			return;
		}

		const response = await fetch("/api/auth/display-name", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ displayName }),
		});

		if (!response.ok) {
			const { error } = await response.json();
			setDisplayNameChangeError(error);
			return;
		}

		close();
		router.refresh();
	};

	const handleSubmitUsernameChange = async (close: () => void) => {
		const parsed = usernameSchema.safeParse(username);
		if (!parsed.success) {
			setUsernameChangeError(parsed.error.errors[0].message);
			return;
		}

		const response = await fetch("/api/auth/username", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username }),
		});

		if (!response.ok) {
			const { error } = await response.json();
			setUsernameChangeError(error);
			return;
		}

		close();
		router.refresh();
	};

	return (
		<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-4 flex flex-col gap-4">
			<div>
				<h2 className="text-2xl font-bold">Profile Settings</h2>
				<p className="text-sm text-zinc-500">Update your account info, and username.</p>
			</div>

			{/* Separator */}
			<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium my-1">
				<hr className="flex-grow border-zinc-300" />
				<span>Account Info</span>
				<hr className="flex-grow border-zinc-300" />
			</div>

			{/* Change Name */}
			<div className="grid grid-cols-2">
				<div>
					<label htmlFor="deletion" className="font-semibold">
						Change Display Name
					</label>
					<p className="text-sm text-zinc-500">This is a display name shown on your profile — feel free to change it anytime</p>
				</div>

				<div className="flex justify-end gap-1">
					<input
						type="text"
						className="pill input w-full max-w-64"
						placeholder="Type here..."
						value={displayName}
						onChange={(e) => setDisplayName(e.target.value)}
					/>
					<SubmitDialogButton
						title="Confirm Display Name Change"
						description="Update your display name? This will only be visible on your profile. You can change it again later."
						error={displayNameChangeError}
						onSubmit={handleSubmitDisplayNameChange}
					>
						<div className="bg-orange-100 rounded-xl border-2 border-orange-400 mt-4 px-2 py-1">
							<p className="font-semibold">New display name:</p>
							<p className="indent-4">'{displayName}'</p>
						</div>
					</SubmitDialogButton>
				</div>
			</div>

			{/* Change Username */}
			<div className="grid grid-cols-2">
				<div>
					<label htmlFor="deletion" className="font-semibold">
						Change Username
					</label>
					<p className="text-sm text-zinc-500">Your unique tag on the site. Can only be changed once every 90 days</p>
				</div>

				<div className="flex justify-end gap-1">
					<div className="relative">
						<input
							type="text"
							className="pill input w-full max-w-64 indent-4"
							placeholder="Type here..."
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
						<span className="absolute top-1/2 -translate-y-1/2 left-4 select-none">@</span>
					</div>
					<SubmitDialogButton
						title="Confirm Username Change"
						description="Are you sure? Your username is your unique indentifier and can only be changed every 90 days."
						error={usernameChangeError}
						onSubmit={handleSubmitUsernameChange}
					>
						<p className="text-sm text-zinc-500 mt-2">
							After submitting, you can change it again on{" "}
							{usernameDate.toDate().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
						</p>

						<div className="bg-orange-100 rounded-xl border-2 border-orange-400 mt-4 px-2 py-1">
							<p className="font-semibold">New username:</p>
							<p className="indent-4">'@{username}'</p>
						</div>
					</SubmitDialogButton>
				</div>
			</div>

			{/* Separator */}
			<div className="flex items-center gap-4 text-zinc-500 text-sm font-medium my-1">
				<hr className="flex-grow border-zinc-300" />
				<span>Danger Zone</span>
				<hr className="flex-grow border-zinc-300" />
			</div>

			{/* Delete Account */}
			<div className="grid grid-cols-2">
				<div>
					<label htmlFor="deletion" className="font-semibold">
						Delete Account
					</label>
					<p className="text-sm text-zinc-500">This will permanently remove your account and all uploaded Miis. This action cannot be undone</p>
				</div>

				<DeleteAccount />
			</div>
		</div>
	);
}
