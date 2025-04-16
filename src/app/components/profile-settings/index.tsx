"use client";

import { useState } from "react";
import SubmitDialogButton from "./submit-dialog-button";
import DeleteAccount from "./delete-account";

interface Props {
	name: string | null | undefined;
	username: string | null | undefined;
}

export default function ProfileSettings({ name, username }: Props) {
	const [displayName, setDisplayName] = useState(name ?? "");
	const [usernameState, setUsernameState] = useState(username ?? "");

	return (
		<div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-4 flex flex-col gap-4">
			<div>
				<h2 className="text-2xl font-bold">Profile Settings</h2>
				<p className="text-sm text-zinc-500">Update your account info, username, and preferences.</p>
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
					<input type="text" className="pill input w-full max-w-64" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
					<SubmitDialogButton
						title="Confirm Display Name Change"
						description="Update your display name? This will only be visible on your profile. You can change it again later."
						onSubmit={() => {}}
					>
						<div className="bg-orange-100 rounded-xl border-2 border-orange-400 mt-4 px-2 py-1">
							<p className="font-semibold">New display name:</p>
							<p className="indent-4">"{name}"</p>
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
							value={usernameState}
							onChange={(e) => setUsernameState(e.target.value)}
						/>
						<span className="absolute top-1/2 -translate-y-1/2 left-4 select-none">@</span>
					</div>
					<SubmitDialogButton
						title="Confirm Username Change"
						description="Are you sure? Your username is your unique indentifier and can only be changed every 90 days."
						onSubmit={() => {}}
					>
						<div className="bg-orange-100 rounded-xl border-2 border-orange-400 mt-4 px-2 py-1">
							<p className="font-semibold">New username:</p>
							<p className="indent-4">"@{usernameState}"</p>
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
